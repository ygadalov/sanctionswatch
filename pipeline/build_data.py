#!/usr/bin/env python3
"""
Sanctions Aggregator - data ingestion pipeline.

Downloads official sanctions lists (OFAC SDN, UK UKSL, EU FSF, UN SC)
plus OpenSanctions-normalized datasets for Australia (DFAT) and Japan (MOF),
normalizes them into a single JSON schema and produces:

  data/stats.json            - aggregate statistics for the dashboard
  data/entities/<shard>.json - entity shards keyed by first name character
  data/changelog.jsonl       - append-only log of added/removed entries

Run:  python3 pipeline/build_data.py
Deps: python3.10+ stdlib only (xml, csv, json, urllib).
"""

import csv
import io
import json
import os
import re
import sys
import unicodedata
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data"
UA = {"User-Agent": "Mozilla/5.0 (compatible; SanctionsAggregator/1.0)"}

SOURCES = {
    "US": {
        "name": "OFAC SDN + Consolidated (США)",
        "url": "https://sanctionslistservice.ofac.treas.gov/api/download/sdn.xml",
        "file": "ofac_sdn.xml",
    },
    "UK": {
        "name": "UK Sanctions List (Великобритания)",
        "url": "https://sanctionslist.fcdo.gov.uk/docs/UK-Sanctions-List.xml",
        "file": "uk.xml",
    },
    # Официальный XML EC (webgate.ec.europa.eu/.../xmlFullSanctionsList_1_1) нестабилен:
    # соединение обрывается на ~5.8 МБ. Используем ежедневную нормализацию OpenSanctions.
    "EU": {
        "name": "EU Consolidated FSF (ЕС)",
        "url": "https://data.opensanctions.org/datasets/latest/eu_fsf/targets.simple.csv",
        "file": "eu.csv",
        "via": "OpenSanctions (нормализация официального списка ЕС)",
    },
    "UN": {
        "name": "UN SC Consolidated List (ООН)",
        "url": "https://scsanctions.un.org/resources/xml/en/consolidated.xml",
        "file": "un.xml",
    },
    "AU": {
        "name": "DFAT Consolidated List (Австралия)",
        "url": "https://data.opensanctions.org/datasets/latest/au_dfat_sanctions/targets.simple.csv",
        "file": "au.csv",
        "via": "OpenSanctions (нормализация официального списка DFAT)",
    },
    "JP": {
        "name": "MOF Economic Sanctions (Япония)",
        "url": "https://data.opensanctions.org/datasets/latest/jp_mof_sanctions/targets.simple.csv",
        "file": "jp.csv",
        "via": "OpenSanctions (нормализация официального списка MOF)",
    },
    "CA": {
        "name": "Canadian Consolidated Autonomous Sanctions (Канада)",
        "url": "https://data.opensanctions.org/datasets/latest/ca_dfatd_sema_sanctions/targets.simple.csv",
        "file": "ca.csv",
        "via": "OpenSanctions (нормализация официального списка Global Affairs Canada)",
    },
    "CH": {
        "name": "SECO Sanctions (Швейцария)",
        "url": "https://data.opensanctions.org/datasets/latest/ch_seco_sanctions/targets.simple.csv",
        "file": "ch.csv",
        "via": "OpenSanctions (нормализация официального списка SECO)",
    },
}


# OFAC Consolidated (non-SDN): SSI / NS-CMIC / NS-PLC / CAPTA / NS-MBS.
# Качается отдельно, записи получают source="US" и measures=["non_sdn", <подтип>].
US_CONS = {
    "url": "https://sanctionslistservice.ofac.treas.gov/api/download/consolidated.xml",
    "file": "ofac_cons.xml",
}
# OpenSanctions-зеркало SDN: используется ТОЛЬКО для дат first_seen (OFAC не публикует
# дату включения в машинном виде). Джойн к нашим US-записям — по IMO (суда).
US_OS = {
    "url": "https://data.opensanctions.org/datasets/latest/us_ofac_sdn/targets.simple.csv",
    "file": "us_os.csv",
}
# Подтип non-SDN по коду программы (legacy XML не содержит имени подсписка)
CONS_KIND = {
    "UKRAINE-EO13662": "ssi",      # Sectoral Sanctions Identifications
    "CMIC-EO13959": "cmic",        # Chinese Military-Industrial Complex
    "NS-PLC": "ns_plc",            # Palestinian Legislative Council
    "HKAA": "capta",               # Hong Kong Autonomy Act -> CAPTA
    "PAIPA": "capta",              # CAPTA list
}


def log(msg):
    print(f"[{datetime.now(timezone.utc):%H:%M:%S}] {msg}", flush=True)


def download(key, src=None):
    src = src or SOURCES[key]
    dest = RAW / src["file"]
    RAW.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 10_000 and os.environ.get("REFRESH") != "1":
        log(f"{key}: использую кеш {dest.name}")
        return dest
    log(f"{key}: скачиваю {src['url']}")
    req = urllib.request.Request(src["url"], headers=UA)
    with urllib.request.urlopen(req, timeout=300) as r, open(dest, "wb") as f:
        f.write(r.read())
    log(f"{key}: {dest.stat().st_size / 1e6:.1f} МБ")
    return dest


def clean(s):
    if not s:
        return ""
    return re.sub(r"\s+", " ", s).strip()


def norm_key(name):
    """Normalized matching key: lowercase, no diacritics, no punctuation."""
    name = unicodedata.normalize("NFKD", name or "")
    name = "".join(c for c in name if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9\u0400-\u04ff ]", "", name.lower()).strip()


def shard_of(name):
    k = norm_key(name)
    if not k:
        return "other"
    c = k[0]
    if "a" <= c <= "z":
        return c
    if "0" <= c <= "9":
        return "0-9"
    if "\u0400" <= c <= "\u04ff":
        return "cyrillic"
    return "other"


COUNTRY_MAP = {
    "RUSSIA": "RU", "RUSSIAN FEDERATION": "RU", "IRAN": "IR", "IRAN, ISLAMIC REPUBLIC OF": "IR",
    "CHINA": "CN", "NORTH KOREA": "KP", "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF": "KP",
    "KOREA, NORTH": "KP", "SOUTH KOREA": "KR", "KOREA, REPUBLIC OF": "KR",
    "UKRAINE": "UA", "BELARUS": "BY", "SYRIA": "SY", "SYRIAN ARAB REPUBLIC": "SY",
    "VENEZUELA": "VE", "CUBA": "CU", "MEXICO": "MX", "COLOMBIA": "CO",
    "UNITED ARAB EMIRATES": "AE", "TURKEY": "TR", "TÜRKIYE": "TR", "CYPRUS": "CY",
    "UNITED KINGDOM": "GB", "UNITED STATES": "US", "GERMANY": "DE", "FRANCE": "FR",
    "ITALY": "IT", "SPAIN": "ES", "NETHERLANDS": "NL", "SWITZERLAND": "CH",
    "AFGHANISTAN": "AF", "IRAQ": "IQ", "LEBANON": "LB", "YEMEN": "YE", "LIBYA": "LY",
    "SOMALIA": "SO", "SUDAN": "SD", "SOUTH SUDAN": "SS", "MYANMAR": "MM", "BURMA": "MM",
    "HONG KONG": "HK", "TAIWAN": "TW", "SINGAPORE": "SG", "INDIA": "IN", "PAKISTAN": "PK",
    "KAZAKHSTAN": "KZ", "KYRGYZSTAN": "KG", "UZBEKISTAN": "UZ", "TAJIKISTAN": "TJ",
    "ARMENIA": "AM", "AZERBAIJAN": "AZ", "GEORGIA": "GE", "MOLDOVA": "MD",
    "SERBIA": "RS", "BOSNIA AND HERZEGOVINA": "BA", "MONTENEGRO": "ME", "NORTH MACEDONIA": "MK",
    "ZIMBABWE": "ZW", "MALI": "ML", "NICARAGUA": "NI", "GUATEMALA": "GT", "HONDURAS": "HN",
    "PANAMA": "PA", "BRAZIL": "BR", "ARGENTINA": "AR", "EGYPT": "EG", "SAUDI ARABIA": "SA",
    "QATAR": "QA", "KUWAIT": "KW", "BAHRAIN": "BH", "OMAN": "OM", "JORDAN": "JO",
    "ISRAEL": "IL", "PALESTINE": "PS", "THAILAND": "TH", "VIETNAM": "VN", "LAOS": "LA",
    "CAMBODIA": "KH", "MALAYSIA": "MY", "INDONESIA": "ID", "PHILIPPINES": "PH",
    "JAPAN": "JP", "AUSTRALIA": "AU", "CANADA": "CA", "SOUTH AFRICA": "ZA",
    "NIGERIA": "NG", "KENYA": "KE", "ETHIOPIA": "ET", "DEMOCRATIC REPUBLIC OF THE CONGO": "CD",
    "CONGO, DEMOCRATIC REPUBLIC OF THE": "CD", "CENTRAL AFRICAN REPUBLIC": "CF",
    "MALI ": "ML", "BURUNDI": "BI", "ERITREA": "ER", "GUINEA": "GN", "GUINEA-BISSAU": "GW",
    "HUNGARY": "HU", "POLAND": "PL", "CZECHIA": "CZ", "CZECH REPUBLIC": "CZ",
    "SLOVAKIA": "SK", "BULGARIA": "BG", "ROMANIA": "RO", "GREECE": "GR", "AUSTRIA": "AT",
    "BELGIUM": "BE", "LUXEMBOURG": "LU", "LIECHTENSTEIN": "LI", "MONACO": "MC",
    "BRITISH VIRGIN ISLANDS": "VG", "VIRGIN ISLANDS, BRITISH": "VG", "CAYMAN ISLANDS": "KY",
    "MARSHALL ISLANDS": "MH", "LIBERIA": "LR", "MALTA": "MT", "LATVIA": "LV",
    "LITHUANIA": "LT", "ESTONIA": "EE", "FINLAND": "FI", "SWEDEN": "SE", "NORWAY": "NO",
    "DENMARK": "DK", "IRELAND": "IE", "PORTUGAL": "PT", "CROATIA": "HR", "SLOVENIA": "SI",
    "ALBANIA": "AL", "KOSOVO": "XK", "BANGLADESH": "BD", "SRI LANKA": "LK", "NEPAL": "NP",
    "MONGOLIA": "MN", "NEW ZEALAND": "NZ", "FIJI": "FJ", "PAPUA NEW GUINEA": "PG",
    "CHAD": "TD", "NIGER": "NE", "BURKINA FASO": "BF", "SENEGAL": "SN", "TOGO": "TG",
    "EQUATORIAL GUINEA": "GQ", "GABON": "GA", "ANGOLA": "AO", "MOZAMBIQUE": "MZ",
    "DOMINICAN REPUBLIC": "DO", "HAITI": "HT", "JAMAICA": "JM", "TRINIDAD AND TOBAGO": "TT",
    "ECUADOR": "EC", "PERU": "PE", "CHILE": "CL", "BOLIVIA": "BO", "PARAGUAY": "PY",
    "URUGUAY": "UY", "COSTA RICA": "CR", "EL SALVADOR": "SV", "BELIZE": "BZ",
    "IVORY COAST": "CI", "COTE D'IVOIRE": "CI", "GHANA": "GH", "CAMEROON": "CM",
    "RWANDA": "RW", "UGANDA": "UG", "TANZANIA": "TZ", "ZAMBIA": "ZM", "MALAWI": "MW",
}


def norm_country(c):
    c = clean(c).upper().rstrip(".")
    if not c or c in ("UNKNOWN", "UNKNOWN;"):
        return ""
    if len(c) == 2 and c.isalpha():
        return c
    return COUNTRY_MAP.get(c, c.title() if len(c) > 3 else c)


_PAREN_RE = re.compile(r"\s*\([^)]*\)")
_PAREN_OPEN_RE = re.compile(r"\s*\([^)]*$")

def clean_alias(a):
    """Убирает служебные пометки источников вида «(previously listed as)» из псевдонимов
    (включая обрезанные незакрытые скобки)."""
    return clean(_PAREN_OPEN_RE.sub("", _PAREN_RE.sub(" ", a or "")))


def iso_date(s):
    """Нормализация дат источников к YYYY-MM-DD (UK даёт DD/MM/YYYY, OS — timestamp)."""
    s = clean(s)
    if not s:
        return ""
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        return m.group(0)
    m = re.match(r"(\d{1,2})/(\d{1,2})/(\d{4})", s)
    if m:
        return f"{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}"
    return s


def entity(**kw):
    e = {
        "id": "",
        "source": "",
        "type": "unknown",
        "name": "",
        "aliases": [],
        "weak_aliases": [],
        "countries": [],
        "programs": [],
        "dob": "",
        "identifiers": [],
        "listed_on": "",
        "listed_on_kind": "",  # "official" — дата из источника; "os" — first_seen OpenSanctions (прокси)
        "remarks": "",
        "measures": [],
    }
    e.update({k: v for k, v in kw.items() if k in e})
    if not e["measures"]:
        e["measures"] = ["blocking"]
    e["aliases"] = sorted(set(filter(None, (clean_alias(a) for a in e["aliases"]))))[:30]
    e["weak_aliases"] = sorted(set(filter(None, (clean_alias(a) for a in e["weak_aliases"]))))[:30]
    e["countries"] = sorted(set(filter(None, (norm_country(c) for c in e["countries"]))))
    e["programs"] = sorted(set(clean(p) for p in e["programs"] if clean(p)))[:10]
    return e


# Тематические группы санкционных программ (порядок важен — первое совпадение)
PROGRAM_GROUPS = [
    ("Россия / Украина", r"RUSSIA|UKRAINE|UKR\b|\bRUS\b|RUSDA|ロシア|クリミア|ウクライナ"),
    ("Беларусь", r"BELARUS|\bBLR\b"),
    ("Иран", r"IRAN|\bIRN\b|IFSR"),
    ("КНДР", r"DPRK|NORTH KOREA|KOREA|\bPRK\b"),
    ("Терроризм", r"SDGT|FTO|TERROR|AL-QA|ISIS|DAESH|ISIL|TALIBAN|TAQA|タリバーン|アル・カーイダ"),
    ("Наркотрафик", r"SDNT|NARCOTIC|TCO|FENTANYL|ILLICIT-DRUGS"),
    ("Кибер", r"CYBER|MALICIOUS CYBER"),
    ("Magnitsky / права человека", r"MAGNIT|GLOMAG|GLOBAL HUMAN RIGHTS|HRIT|\bHR\b"),
    ("Сирия", r"SYRIA|CAESAR|\bSYR\b|EO13894"),
    ("Ирак", r"IRAQ|\bIRQ\b"),
    ("Венесуэла", r"VENEZUELA|\bVEN\b"),
    ("Куба", r"CUBA"),
    ("Ливия", r"LIBYA|\bLYB\b"),
    ("Йемен", r"YEMEN|\bYEM\b"),
    ("Сомали", r"SOMALIA|\bSOM\b"),
    ("Судан / Юж. Судан", r"SUDAN|\bSDN\b"),
    ("Мьянма", r"MYANMAR|BURMA|\bMMR\b"),
    ("Афганистан", r"AFGHAN|\bAFG\b"),
    ("Китай / Синьцзян / Гонконг", r"XINJIANG|HONG KONG|HK-EO|CHINA|XPCC|CMIC"),
    ("Балканы", r"BALKAN|BOSNIA|SERBIA|KOSOVO"),
    ("Никарагуа", r"NICARAGUA|\bNIC\b"),
    ("Зимбабве", r"ZIMBABWE|\bZIM\b"),
    ("Африка (Мали, ЦАР, Конго)", r"MALI|CAR\b|CENTRAL AFRICAN|DRCONGO|\bCOD\b|CONGO"),
    ("Непролиферация", r"NPWMD|WMD|PROLIF|ITSR"),
    ("Морские / теневой флот", r"PIRACY|MARITIME|\(VESSELS\)|VESSELS\) -"),
]
_PROG_RE = [(g, re.compile(p, re.I)) for g, p in PROGRAM_GROUPS]


def program_groups(programs, name="", remarks=""):
    text = " ".join(programs)
    groups = set()
    for g, rx in _PROG_RE:
        if rx.search(text):
            groups.add(g)
    return sorted(groups) or ["Прочие / без программы"]


def enrich_country(e):
    """Консервативная доатрибуция страны для записей без страны."""
    if e["countries"]:
        return e
    blob = " ".join(e["identifiers"]) + " " + e["remarks"]
    if re.search(r"\bOGRN\b|\bОГРН\b", blob, re.I):
        e["countries"] = ["RU"]
    elif re.search(r"\bRussia\b|Russian Federation", blob) and "Linked To" not in blob:
        e["countries"] = ["RU"]
    return e


# ---------------- Parsers ----------------

def parse_us(path, id_prefix="US", measures=None):
    ns = {"n": "https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/XML"}
    tree = ET.parse(path)
    out = []
    for e in tree.getroot().findall("n:sdnEntry", ns):
        last = clean(e.findtext("n:lastName", "", ns))
        first = clean(e.findtext("n:firstName", "", ns))
        name = clean(f"{first} {last}")
        typ = {"individual": "person", "entity": "entity", "vessel": "vessel",
               "aircraft": "aircraft"}.get(clean(e.findtext("n:sdnType", "", ns)).lower(), "entity")
        aliases, weak_aliases = [], []
        for a in e.findall(".//n:aka", ns):
            aka = clean(f"{clean(a.findtext('n:firstName', '', ns))} {clean(a.findtext('n:lastName', '', ns))}")
            if not aka:
                continue
            # category strong/weak — качество псевдонима по OFAC; weak = возможно случайное совпадение
            if clean(a.findtext("n:category", "", ns)).lower() == "weak":
                weak_aliases.append(aka)
            else:
                aliases.append(aka)
        countries = [clean(a.findtext("n:country", "", ns)) for a in e.findall(".//n:address", ns)]
        countries += [clean(nt.findtext("n:country", "", ns)) for nt in e.findall(".//n:nationality", ns)]
        programs = [clean(p.text) for p in e.findall(".//n:program", ns)]
        dobs = [clean(d.findtext("n:dateOfBirth", "", ns)) for d in e.findall(".//n:dateOfBirthItem", ns)]
        ids = []
        secondary = False
        for i in e.findall(".//n:id", ns):
            t, num = clean(i.findtext("n:idType", "", ns)), clean(i.findtext("n:idNumber", "", ns))
            if "secondary sanctions risk" in t.lower():
                secondary = True  # это не идентификатор, а маркер вторичных санкций
                continue
            if num:
                ids.append(f"{t}: {num}" if t else num)
        m = list(measures) if measures else ["blocking"]
        if secondary:
            m.append("secondary")
        if measures:  # non-SDN: определяем подсписок по коду программы
            kind = next((CONS_KIND[p] for p in programs if p in CONS_KIND), "ns_mbs")
            m.append(kind)
        out.append(entity(
            id=f"{id_prefix}-{e.findtext('n:uid', '', ns)}", source="US", type=typ,
            name=name, aliases=aliases, weak_aliases=weak_aliases, countries=countries, programs=programs,
            dob=dobs[0] if dobs else "", identifiers=ids[:10],
            remarks=clean(e.findtext("n:remarks", "", ns))[:500],
            measures=m,
        ))
    return out


def parse_uk(path):
    tree = ET.parse(path)
    out = []
    for d in tree.getroot().findall("Designation"):
        names = d.findall("./Names/Name")
        primary, aliases = "", []
        for n in names:
            full = clean(" ".join(clean(n.findtext(f"Name{i}", "")) for i in range(1, 7)))
            if not full:
                continue
            if clean(n.findtext("NameType", "")).lower().startswith("primary"):
                primary = primary or full
            else:
                aliases.append(full)
        for n in d.findall("./NonLatinNames/NonLatinName"):
            aliases.append(clean(n.findtext("NameNonLatinScript", "")))
        typ = {"individual": "person", "entity": "entity", "ship": "vessel"}.get(
            clean(d.findtext("IndividualEntityShip", "")).lower(), "entity")
        countries = [clean(a.findtext("AddressCountry", "")) for a in d.findall("./Addresses/Address")]
        countries += [clean(x) for x in d.findtext("Nationalities", "").split(",")]
        dob = ""
        if d.find("./IndividualDetails") is not None:
            bd = d.find("./IndividualDetails//BirthDate")
            if bd is not None:
                dob = clean(" ".join(clean(bd.findtext(x, "")) for x in ("Day", "Month", "Year")))
        ids = []
        imo = d.findtext("./ShipDetails/IMO", "")
        if imo:
            ids.append(f"IMO: {imo}")
        uid = clean(d.findtext("UniqueID", ""))
        out.append(entity(
            id=f"UK-{uid}", source="UK", type=typ, name=primary, aliases=aliases,
            countries=countries, programs=[clean(d.findtext("RegimeName", ""))],
            dob=dob, identifiers=ids,
            listed_on=iso_date(clean(d.findtext("DateDesignated", ""))),
            listed_on_kind="official",
            remarks=clean(d.findtext("UKStatementofReasons", ""))[:500],
        ))
    return out


def parse_eu(path):
    ns = {"e": "http://eu.europa.ec/fpi/fsd/export"}
    tree = ET.parse(path)
    out = []
    for se in tree.getroot().findall("e:sanctionEntity", ns):
        typ = {"P": "person", "E": "entity", "None": "entity"}.get(
            se.find("e:subjectType", ns).get("classificationCode", "E"), "entity")
        primary, aliases = "", []
        for na in se.findall("e:nameAlias", ns):
            whole = clean(na.get("wholeName")) or clean(
                f"{na.get('firstName','')} {na.get('middleName','')} {na.get('lastName','')}")
            if not whole:
                continue
            if not primary:
                primary = whole
            else:
                aliases.append(whole)
        countries = [c.get("countryIso2Code", "") for c in se.findall("e:citizenship", ns)]
        countries += [a.get("countryIso2Code", "") for a in se.findall("e:address", ns)]
        dob, pob = "", ""
        bd = se.find("e:birthdate", ns)
        if bd is not None:
            dob = clean(bd.get("birthdate", ""))
        ids = []
        for i in se.findall("e:identification", ns):
            num = i.get("number", "")
            if num:
                ids.append(f"{i.get('identificationTypeCode','id')}: {num}")
        reg = se.find("e:regulation", ns)
        prog = reg.get("programme", "") if reg is not None else ""
        listed = reg.get("entryIntoForceDate", "") if reg is not None else ""
        out.append(entity(
            id=f"EU-{se.get('logicalId','')}", source="EU", type=typ, name=primary,
            aliases=aliases, countries=countries, programs=[prog], dob=dob,
            identifiers=ids[:10], listed_on=listed,
            remarks=clean(se.findtext("e:remark", "", ns))[:500],
        ))
    return out


def parse_un(path):
    tree = ET.parse(path)
    out = []
    root = tree.getroot()

    def aliases_of(node, tag, fields):
        return [clean(" ".join(clean(a.findtext(f, "")) for f in fields))
                for a in node.findall(tag)]

    for ind in root.findall("./INDIVIDUALS/INDIVIDUAL"):
        name = clean(" ".join(clean(ind.findtext(f, "")) for f in
                              ("FIRST_NAME", "SECOND_NAME", "THIRD_NAME", "FOURTH_NAME")))
        countries = [clean(n.findtext("COUNTRY", "")) for n in ind.findall("./INDIVIDUAL_ADDRESS")]
        countries += [clean(n.text) for n in ind.findall("./NATIONALITY/VALUE")]
        dob = ""
        if ind.find("./INDIVIDUAL_DATE_OF_BIRTH/DATE") is not None:
            dob = clean(ind.findtext("./INDIVIDUAL_DATE_OF_BIRTH/DATE", ""))
        out.append(entity(
            id=f"UN-{ind.findtext('DATAID','')}", source="UN", type="person", name=name,
            aliases=aliases_of(ind, "./INDIVIDUAL_ALIAS", ("ALIAS_NAME",)),
            countries=countries, programs=[clean(ind.findtext("UN_LIST_TYPE", ""))],
            dob=dob, listed_on=iso_date(ind.findtext("LISTED_ON", "")), listed_on_kind="official",
            remarks=clean(ind.findtext("COMMENTS1", ""))[:500],
        ))
    for ent in root.findall("./ENTITIES/ENTITY"):
        name = clean(ent.findtext("FIRST_NAME", ""))
        countries = [clean(a.findtext("COUNTRY", "")) for a in ent.findall("./ENTITY_ADDRESS")]
        out.append(entity(
            id=f"UN-{ent.findtext('DATAID','')}", source="UN", type="entity", name=name,
            aliases=aliases_of(ent, "./ENTITY_ALIAS", ("ALIAS_NAME",)),
            countries=countries, programs=[clean(ent.findtext("UN_LIST_TYPE", ""))],
            listed_on=iso_date(ent.findtext("LISTED_ON", "")), listed_on_kind="official",
            remarks=clean(ent.findtext("COMMENTS1", ""))[:500],
        ))
    return out


def parse_os_csv(path, source):
    """OpenSanctions targets.simple.csv for AU/JP."""
    out = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            typ = {"person": "person", "company": "entity", "organization": "entity",
                   "vessel": "vessel", "aircraft": "aircraft", "legalentity": "entity",
                   "publicbody": "entity"}.get((row.get("schema") or "").lower(), "entity")
            out.append(entity(
                id=f"{source}-{row.get('id','')}", source=source, type=typ,
                name=clean(row.get("name", "")),
                aliases=(row.get("aliases") or "").split(";"),
                countries=(row.get("countries") or "").split(";"),
                programs=[clean(row.get("sanctions", ""))],
                dob=clean(row.get("birth_date", "")),
                identifiers=(row.get("identifiers") or "").split(";")[:10],
                listed_on=iso_date(row.get("first_seen", "")), listed_on_kind="os" if row.get("first_seen") else "",
            ))
    return out


GEO_URLS = [
    "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson",
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson",
]

def _rnd_geo(coords, nd=2):
    if isinstance(coords[0], (int, float)):
        return [round(coords[0], nd), round(coords[1], nd)]
    return [_rnd_geo(c, nd) for c in coords]

def ensure_geojson():
    """data/countries.geo.json — статичная геометрия стран для карты (Natural Earth 110m,
    упрощённая до iso2/name + координаты с 2 знаками). Файл не хранится в репозитории
    (текстовый лимит API), поэтому при отсутствии генерируется здесь."""
    dest = OUT / "countries.geo.json"
    if dest.exists() and dest.stat().st_size > 50_000:
        return
    last_err = None
    for url in GEO_URLS:
        try:
            log(f"GEO: скачиваю {url}")
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=120) as r:
                big = json.loads(r.read().decode("utf-8"))
            feats = []
            for f in big["features"]:
                p = f.get("properties", {})
                iso3 = p.get("ADM0_A3")
                iso2 = next((p.get(k) for k in ("ISO_A2", "ISO_A2_EH", "ADM0_ISO")
                             if p.get(k) and p.get(k) != "-99"), None)
                name = p.get("NAME_EN") or p.get("NAME") or ""
                if not iso2 or not iso3 or not f.get("geometry"):
                    continue
                feats.append({"type": "Feature", "id": iso3,
                              "properties": {"iso2": iso2, "name": name},
                              "geometry": {"type": f["geometry"]["type"],
                                           "coordinates": _rnd_geo(f["geometry"]["coordinates"])}})
            dest.write_text(json.dumps({"type": "FeatureCollection", "features": feats},
                                       ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
            log(f"GEO: {len(feats)} стран, {dest.stat().st_size / 1024:.0f} КБ")
            return
        except Exception as ex:
            last_err = ex
            log(f"GEO: сбой ({ex})")
    log(f"GEO: карта недоступна, продолжаю без неё ({last_err})")


# ---------------- Main ----------------

# Журнал здоровья источников: каждый источник отрабатывает независимо;
# сбой одного не роняет сборку — откат на кеш (stale) или пропуск (failed).
HEALTH = {}

def fetch_source(key, parser, src=None, note=""):
    s = src or SOURCES[key]
    h = {"name": s.get("name", note or key), "url": s["url"].split("?")[0],
         "status": "failed", "records": 0, "error": "", "note": note}
    dest = RAW / s["file"]
    try:
        path = download(key, src)
        ents = parser(path)
        h.update(status="ok", records=len(ents),
                 cached=not (os.environ.get("REFRESH") == "1"))
        HEALTH[key] = h
        return ents
    except Exception as ex:
        h["error"] = str(ex)[:300]
        if dest.exists() and dest.stat().st_size > 10_000:
            try:
                ents = parser(dest)  # откат на последний удачный снимок
                h.update(status="stale", records=len(ents))
                HEALTH[key] = h
                log(f"{key}: СБОЙ скачивания, использую устаревший кеш ({ex})")
                return ents
            except Exception as ex2:
                h["error"] = f"{h['error']} | cache parse: {str(ex2)[:150]}"
        HEALTH[key] = h
        log(f"{key}: ИСТОЧНИК НЕДОСТУПЕН, пропускаю ({ex})")
        return []


def main():
    parsers = {"US": parse_us, "UK": parse_uk, "UN": parse_un,
               "EU": lambda p: parse_os_csv(p, "EU"),
               "AU": lambda p: parse_os_csv(p, "AU"), "JP": lambda p: parse_os_csv(p, "JP"),
               "CA": lambda p: parse_os_csv(p, "CA"), "CH": lambda p: parse_os_csv(p, "CH")}
    all_entities = []
    source_dates = {}
    for key, parser in parsers.items():
        ents = fetch_source(key, parser)
        if ents:
            log(f"{key}: распознано {len(ents)} записей")
        all_entities.extend(ents)
        source_dates[key] = datetime.now(timezone.utc).date().isoformat()
    # OFAC Consolidated (non-SDN) — дополняет источник US
    cons_ents = fetch_source("US_CONS", lambda p: parse_us(p, id_prefix="USC", measures=["non_sdn"]),
                             US_CONS, note="OFAC Consolidated non-SDN (дополнение к US)")
    log(f"US_CONS: распознано {len(cons_ents)} записей (non-SDN)")
    all_entities.extend(cons_ents)

    # Даты first_seen для судов OFAC: точный джойн по IMO к OpenSanctions-зеркалу SDN
    try:
        us_os_path = download("US_OS", US_OS)
        imo_seen = {}
        with open(us_os_path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                fs = iso_date(row.get("first_seen", ""))
                if not fs:
                    continue
                for m in re.finditer(r"IMO\s*:?\s*(\d{7})", row.get("identifiers", ""), re.I):
                    imo_seen[m.group(1)] = fs
        joined = 0
        for e in all_entities:
            if e["source"] != "US" or e["listed_on"]:
                continue
            imos = [m.group(1) for i in e["identifiers"]
                    for m in [re.search(r"IMO\s*:?\s*(\d{7})", i, re.I)] if m]
            for imo in imos:
                if imo in imo_seen:
                    e["listed_on"], e["listed_on_kind"] = imo_seen[imo], "os"
                    joined += 1
                    break
        log(f"US first_seen по IMO: {joined} судов из {len(imo_seen)} в зеркале")
        HEALTH["US_OS"] = {"name": "OpenSanctions SDN-зеркало (даты first_seen для судов US)",
                           "url": US_OS["url"].split("?")[0], "status": "ok",
                           "records": len(imo_seen), "error": "", "note": "вспомогательный"}
    except Exception as ex:
        log(f"US_OS: пропущено ({ex})")
        HEALTH["US_OS"] = {"name": "OpenSanctions SDN-зеркало (даты first_seen для судов US)",
                           "url": US_OS["url"].split("?")[0], "status": "failed",
                           "records": 0, "error": str(ex)[:300], "note": "вспомогательный"}

    # De-dup: drop entries without any name
    all_entities = [e for e in all_entities if e["name"]]

    # Геометрия стран для карты (генерируется при отсутствии; сбой не роняет сборку)
    ensure_geojson()

    # Предохранитель: если суммарно записей < 80% предыдущего среза — данные не публикуем,
    # чтобы сбой источников не обнулил сайт. health.json всё равно пишем ниже.
    prev_stats = OUT / "stats.json"
    if prev_stats.exists():
        prev_total = json.loads(prev_stats.read_text(encoding="utf-8")).get("total", 0)
        if prev_total and len(all_entities) < prev_total * 0.8:
            log(f"ПРЕДОХРАНИТЕЛЬ: {len(all_entities)} записей против {prev_total} в прошлом срезе — публикация отменена")
            (OUT / "health.json").write_text(json.dumps(
                {"generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                 "guard": f"aborted: {len(all_entities)} < 80% of {prev_total}",
                 "sources": HEALTH}, ensure_ascii=False, indent=1), encoding="utf-8")
            sys.exit(1)
    for e in all_entities:
        e["key"] = norm_key(e["name"])
        enrich_country(e)

    # ---- stats ----
    by_source = Counter(e["source"] for e in all_entities)
    by_type = Counter(e["type"] for e in all_entities)
    by_country = Counter()
    by_program = Counter()
    by_measure = Counter()
    by_year = Counter()
    by_year_official, by_year_os = Counter(), Counter()
    for e in all_entities:
        for c in e["countries"] or ["ZZ"]:
            by_country[c] += 1
        for g in program_groups(e["programs"], e["name"], e["remarks"]):
            by_program[g] += 1
        for m in e["measures"]:
            by_measure[m] += 1
        if e["listed_on"][:4].isdigit():
            by_year[e["listed_on"][:4]] += 1
            (by_year_official if e["listed_on_kind"] == "official" else by_year_os)[e["listed_on"][:4]] += 1
    # Уникальные субъекты: дедупликация по (норм. имя + дата рождения) между списками.
    # Оценочная метрика: формальная дедупликация сущностей требует графа связей.
    uniq = set()
    for e in all_entities:
        uniq.add((e["key"], e["dob"]))
    stats = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "total": len(all_entities),
        "unique_subjects": len(uniq),
        "by_source": dict(by_source.most_common()),
        "by_type": dict(by_type.most_common()),
        "by_country": dict(by_country.most_common(60)),
        "by_program": dict(by_program.most_common(25)),
        "by_measure": dict(by_measure.most_common()),
        # год включения в список: official (UK/UN) + прокси first_seen (EU/AU/JP/CA/CH, суды US)
        "by_year": dict(sorted(by_year.items())),
        "by_year_official": dict(sorted(by_year_official.items())),
        "by_year_os": dict(sorted(by_year_os.items())),
        "by_year_note": "official: UK/UN designation dates; os: OpenSanctions first_seen proxy (tracking started 2022-2024, so pre-2022 os years mean 'not earlier than')",
        "sources": {k: {"name": v["name"], "url": v["url"].split("?")[0],
                        "via": v.get("via", "официальный источник (прямая загрузка)")}
                    for k, v in SOURCES.items()},
    }
    (OUT / "entities").mkdir(parents=True, exist_ok=True)
    (OUT / "stats.json").write_text(json.dumps(stats, ensure_ascii=False, indent=1))
    (OUT / "health.json").write_text(json.dumps(
        {"generated_at": stats["generated_at"], "guard": "", "sources": HEALTH},
        ensure_ascii=False, indent=1), encoding="utf-8")

    # ---- single flat file (client loads it once, browser caches it) ----
    (OUT / "entities").mkdir(parents=True, exist_ok=True)
    # имена прежних записей — нужны чейнджлогу, чтобы назвать удалённые
    prev_names = {}
    old_all = OUT / "entities" / "all.json"
    if old_all.exists():
        try:
            for e in json.loads(old_all.read_text()):
                prev_names[e["id"]] = e["name"]
        except Exception:
            pass
    for old in (OUT / "entities").glob("*.json"):
        old.rmdir() if old.is_dir() else old.unlink()
    all_entities.sort(key=lambda x: x["key"])
    (OUT / "entities" / "all.json").write_text(
        json.dumps(all_entities, ensure_ascii=False, separators=(",", ":")))
    size_mb = (OUT / "entities" / "all.json").stat().st_size / 1e6
    log(f"entities/all.json: {size_mb:.1f} МБ")

    # ---- changelog (diff vs previous snapshot) ----
    snap_path = OUT / "snapshot_ids.json"
    prev = {}
    if snap_path.exists():
        prev = json.loads(snap_path.read_text())
    cur = defaultdict(set)
    names = {}
    for e in all_entities:
        cur[e["source"]].add(e["id"])
        names[e["id"]] = e["name"]
    changes = {}
    for src in SOURCES:
        added = sorted(cur[src] - set(prev.get(src, [])))
        removed = sorted(set(prev.get(src, [])) - cur[src])
        if prev.get(src) is not None and (added or removed):
            changes[src] = {
                "added": [{"id": i, "name": names.get(i, "")} for i in added[:500]],
                "removed": [{"id": i, "name": prev_names.get(i, "")} for i in removed[:500]],
                "removed_count": len(removed),
                "added_count": len(added),
            }
    if changes or not prev:
        entry = {"ts": stats["generated_at"], "changes": changes,
                 "initial": not bool(prev)}
        with open(OUT / "changelog.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        log(f"Changelog: {json.dumps({s: (c['added_count'], c['removed_count']) for s, c in changes.items()})}")
    snap_path.write_text(json.dumps({k: sorted(v) for k, v in cur.items()}))

    # ---- cache-busting: штампуем версию ассетов в index.html ----
    idx = ROOT / "index.html"
    if idx.exists():
        html = idx.read_text()
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M")
        html = re.sub(r'(app\.js|styles\.css|fonts\.css)\?v=[^"\']*', rf"\1?v={stamp}", html)
        html = re.sub(r"(app\.js|styles\.css|fonts\.css)(?!\?)", rf"\1?v={stamp}", html)
        idx.write_text(html)
        log(f"Asset stamp: {stamp}")

    log(f"Готово: {len(all_entities)} записей")


if __name__ == "__main__":
    sys.exit(main())
