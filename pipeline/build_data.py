#!/usr/bin/env python3
"""
SanctionsWatch — сборка данных для статического фронтенда.

Источники:
  1. OpenSanctions datasets `us_ofac_sdn`, `us_ofac_cons`, `eu_fsf`, `gb_hmt_sanctions`,
     `ch_seco_sanctions`, `un_sc_sanctions`, `au_dfat_sanctions`,
     `ca_dfatd_sema_sanctions`, `jp_mof_sanctions`, `eu_mare`
     (FTM JSON — один JSON-объект FollowTheMoney на строку).
     Скачиваются с data.opensanctions.org, кэшируются в data/raw/<source>.json
     и при недоступности сети переиспользуются.

Выход:
  data/entities/all.json          — плоский массив всех сущностей
  data/entities/index.json        — метаданные (дата, источники, статистика)
  data/changelog/changes.jsonl    — журнал изменений между сборками
  data/changelog/latest.json      — сводка последней сборки

Идемпотентно: при повторном запуске без изменений источников
перезаписывает только all.json/index.json, changelog не растёт.
"""

import hashlib
import io
import json
import os
import re
import sys
import time
import unicodedata
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
ENT = ROOT / "data" / "entities"
LOG = ROOT / "data" / "changelog"
for d in (RAW, ENT, LOG):
    d.mkdir(parents=True, exist_ok=True)

UA = "SanctionsWatch/1.0 (+static sanctions aggregator; public lists only)"

# Наборы OpenSanctions -> наш короткий код источника.
OS_SOURCES = {
    "us_ofac_sdn":            "US",
    "us_ofac_cons":           "US",
    "eu_fsf":                 "EU",
    "eu_mare":                "EUMARE",
    "gb_hmt_sanctions":       "UK",
    "ch_seco_sanctions":      "CH",
    "un_sc_sanctions":        "UN",
    "au_dfat_sanctions":      "AU",
    "ca_dfatd_sema_sanctions":"CA",
    "jp_mof_sanctions":       "JP",
}

SOURCES_META = {
    "US":    {"name": "OFAC SDN + Consolidated", "org": "U.S. Treasury", "country": "США"},
    "EU":    {"name": "EU Consolidated (FSF)", "org": "European Commission", "country": "ЕС"},
    "EUMARE": {"name": "MARE · Суда теневого флота", "org": "European Union", "country": "ЕС"},
    "UK":    {"name": "UK Sanctions List", "org": "OFSI / FCDO", "country": "Великобритания"},
    "CH":    {"name": "SECO Sanctions", "org": "SECO", "country": "Швейцария"},
    "UN":    {"name": "UN Security Council", "org": "United Nations", "country": "ООН"},
    "AU":    {"name": "DFAT Consolidated", "org": "DFAT", "country": "Австралия"},
    "CA":    {"name": "SEMA Sanctions", "org": "Global Affairs Canada", "country": "Канада"},
    "JP":    {"name": "MOF Sanctions", "org": "Ministry of Finance", "country": "Япония"},
}


def log(*a):
    print(f"[{datetime.now(timezone.utc).strftime('%H:%M:%S')}]", *a, flush=True)


def fetch(url, dest, binary=False):
    """Скачать с кэшем: при ошибке сети используем прошлый файл."""
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Encoding": "identity"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = r.read()
        dest.write_bytes(data)
        log(f"  OK {url} -> {dest.name} ({len(data):,} bytes)")
        return data
    except Exception as e:
        if dest.exists():
            log(f"  NET-FAIL {url}: {e}; использую кэш {dest.name}")
            return dest.read_bytes()
        raise


def norm(s):
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", str(s))
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower().replace("ё", "е")
    s = re.sub(r"[^a-zа-я0-9]+", " ", s, flags=re.I)
    return re.sub(r"\s+", " ", s).strip()


def first(props, key):
    v = props.get(key)
    if isinstance(v, list) and v:
        return v[0]
    return None


def allv(props, key):
    v = props.get(key)
    return v if isinstance(v, list) else []


def sha(s):
    return hashlib.sha1(s.encode("utf-8", "ignore")).hexdigest()[:16]


IMO_RE = re.compile(r"(?<!\d)(?:IMO(?:\s*(?:NUMBER|NO))?\s*[:#.-]*\s*)?(\d{7})(?!\d)", re.I)


def valid_imo(value):
    """7 цифр + контрольная цифра IMO; отсекает даты и прочие числовые поля."""
    digits = re.sub(r"\D", "", str(value or ""))
    if len(digits) != 7:
        return False
    return sum(int(digits[i]) * (7 - i) for i in range(6)) % 10 == int(digits[6])


def imo_from_text(text):
    """IMO из примечаний: строго с маркером IMO, чтобы не подхватить иной номер."""
    for match in re.finditer(r"\bIMO\s*(?:NUMBER|NO)?\s*[:#.-]*\s*(\d{7})\b", str(text or ""), re.I):
        if valid_imo(match.group(1)):
            return match.group(1)
    return None


def add_imo(e, value, origin):
    value = re.sub(r"\D", "", str(value or ""))
    if not valid_imo(value):
        return
    existing = {str(x.get("value", "")).strip() for x in e["identifiers"]}
    if value in existing:
        return
    e["identifiers"].append({"type": "IMO", "value": value})
    e["id_details"].append({
        "kind": "IMO", "label": "IMO",
        "value": value, "extra": origin,
    })


def parse_ftm(text, src_code):
    """FTM JSON-lines -> наша компактная схема."""
    out = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        if rec.get("schema") not in ("Person", "Organization", "Company", "LegalEntity", "Vessel", "Airplane", "PublicBody", "CryptoWallet"):
            continue
        p = rec.get("properties", {})
        name = first(p, "name")
        if not name:
            continue
        schema = rec["schema"]
        etype = {"Person": "person", "Vessel": "vessel", "Airplane": "aircraft",
                 "CryptoWallet": "crypto"}.get(schema, "org")

        aliases = [a for a in allv(p, "alias") + allv(p, "weakAlias") + allv(p, "previousName") if a and a != name]
        countries = sorted(set(allv(p, "country") + allv(p, "nationality") + allv(p, "jurisdiction")))
        programs = sorted(set(allv(p, "program") + allv(p, "programId")))
        dates = sorted(set(allv(p, "listingDate") + allv(p, "createdAt")[:0]))
        topics = allv(p, "topics")
        # санкционные меры OpenSanctions хранит в sanctions.* отдельной сущностью;
        # в targets-* строках попадает notes/summary — возьмём как программу при отсутствии.
        notes = " ".join(allv(p, "notes") + allv(p, "summary") + allv(p, "reason"))[:1200]
        measures = []
        low = notes.lower()
        if any(k in low for k in ("asset freeze", "замороз", "freez")):
            measures.append("freeze")
        if any(k in low for k in ("travel ban", "запрет на въезд", "travel")):
            measures.append("travel")
        if any(k in low for k in ("arms embargo", "оружей")):
            measures.append("arms")
        if "secondary" in low or "вторич" in low:
            measures.append("secondary")
        ids = []
        id_details = []
        for key, label in (("innCode", "ИНН"), ("ogrnCode", "ОГРН"), ("passportNumber", "Паспорт"),
                           ("registrationNumber", "Рег. номер"), ("imoNumber", "IMO"),
                           ("taxNumber", "Налоговый №"), ("idNumber", "ID"), ("leiCode", "LEI"),
                           ("swiftBic", "SWIFT/BIC"), ("icijId", "ICIJ ID")):
            for v in allv(p, key):
                ids.append({"type": label, "value": v})
                id_details.append({"kind": key, "label": label, "value": v})

        # Богатые реквизиты: FTM отдаёт по несколько значений на поле.
        dobs = sorted(set(allv(p, "birthDate")))
        idds = [v for v in allv(p, "idNumber") if v]
        pobs = sorted(set(allv(p, "birthPlace")))
        addrs = sorted(set(allv(p, "address")))
        emails = sorted(set(allv(p, "email")))
        phones = sorted(set(allv(p, "phone")))
        posits = sorted(set(allv(p, "position")))
        genders = sorted(set(allv(p, "gender")))
        websites = sorted(set(allv(p, "website")))

        out.append({
            "id": f"{src_code}:{rec.get('id')}",
            "src": src_code,
            "name": name,
            "nname": norm(name),
            "type": etype,
            "aliases": aliases,
            "naliases": [norm(a) for a in aliases],
            "countries": countries,
            "programs": programs,
            "measures": measures,
            "dob": dobs[0] if dobs else "",
            "dobs": dobs,
            "pob": pobs,
            "addresses": addrs,
            "emails": emails,
            "phones": phones,
            "positions": posits,
            "gender": genders,
            "websites": websites,
            "id_numbers": idds,
            "id_details": id_details,
            "identifiers": ids,
            "date": first(p, "listingDate") or "",
            "topics": topics,
            "notes": notes,
            "source_url": f"https://www.opensanctions.org/entities/{rec.get('id')}/",
        })
    return out


def ch_imo_map(path):
    """В SECO IMO находится внутри вложенной identification; targets этого не видят."""
    if not path.exists():
        return {}
    imos = {}
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            if rec.get("schema") not in ("Vessel", "Organization", "Company", "LegalEntity"):
                continue
            ref = (rec.get("properties", {}).get("entity") or [None])[0]
            if not ref:
                continue
            for value in rec.get("properties", {}).get("imoNumber", []):
                if valid_imo(value):
                    imos[ref] = re.sub(r"\D", "", value)
    return imos


def enrich_ch_imos(all_entities, path):
    imos = ch_imo_map(path)
    if not imos:
        return 0
    added = 0
    for e in all_entities:
        if e["src"] != "CH":
            continue
        os_id = e["id"].split(":", 1)[1]
        value = imos.get(os_id)
        before = len(e["identifiers"])
        add_imo(e, value, "SECO full record")
        added += len(e["identifiers"]) - before
    return added


def dedupe(all_entities):
    """Убираем точные дубли (один и тот же объект из двух наборов одного ведомства)."""
    seen = {}
    out = []
    for e in all_entities:
        key = (e["src"], e["nname"], e["type"], e.get("dob", ""))
        if key in seen:
            old = seen[key]
            # склеиваем алиасы/страны/программы
            for f in ("aliases", "naliases", "countries", "programs", "measures", "identifiers",
                      "dobs", "pob", "addresses", "emails", "phones", "positions", "gender", "websites", "id_numbers", "id_details"):
                merged = old[f] + [x for x in e[f] if x not in old[f]]
                old[f] = merged
            if e["date"] and (not old["date"] or e["date"] < old["date"]):
                old["date"] = e["date"]
            if e["notes"] and len(e["notes"]) > len(old["notes"]):
                old["notes"] = e["notes"]
        else:
            seen[key] = e
            out.append(e)
    return out


def compact(e):
    """Убрать служебные пустые поля для уменьшения JSON."""
    return {k: v for k, v in e.items() if v not in ("", [], None)}


def main():
    t0 = time.time()
    log("=== SanctionsWatch build ===")
    all_entities = []
    stats = {}

    # --- OpenSanctions наборы ---
    for ds, code in OS_SOURCES.items():
        url = f"https://data.opensanctions.org/datasets/latest/{ds}/targets.simple.json"
        dest = RAW / f"os_{ds}.json"
        try:
            raw = fetch(url, dest)
        except Exception as e:
            log(f"  SKIP {ds}: {e}")
            stats[code] = stats.get(code, 0)
            continue
        text = raw.decode("utf-8", "replace")
        ents = parse_ftm(text, code)
        log(f"  {code} <- {ds}: {len(ents)} сущностей")
        stats[code] = stats.get(code, 0) + len(ents)
        all_entities.extend(ents)

    # --- IMO: UK из Statement of Reasons, CH из полного FTM ---
    uk_imo_added = 0
    for e in all_entities:
        if e["src"] == "UK":
            value = imo_from_text(e.get("notes", ""))
            before = len(e["identifiers"])
            add_imo(e, value, "UK Statement of Reasons")
            uk_imo_added += len(e["identifiers"]) - before

    ch_full = RAW / "os_ch_seco_sanctions_full.ftm.json"
    try:
        fetch("https://data.opensanctions.org/datasets/latest/ch_seco_sanctions/entities.ftm.json", ch_full)
    except Exception as e:
        log(f"  CH full FTM unavailable, cache/fallback: {e}")
    ch_imo_added = enrich_ch_imos(all_entities, ch_full)
    log(f"  IMO enrichment: UK +{uk_imo_added}, CH +{ch_imo_added}")

    log(f"Всего до дедупликации: {len(all_entities)}")
    all_entities = dedupe(all_entities)
    for e in all_entities:
        # Страховка от пустых значений и дублей после склейки источников.
        e["identifiers"] = [x for x in e["identifiers"] if str(x.get("value", "")).strip()]
        e["id_details"] = [x for x in e["id_details"] if str(x.get("value", "")).strip()]
    log(f"После дедупликации: {len(all_entities)}")

    all_entities.sort(key=lambda e: (e["src"], e["nname"]))
    entities = [compact(e) for e in all_entities]

    now = datetime.now(timezone.utc)
    payload = json.dumps(entities, ensure_ascii=False, separators=(",", ":"))
    content_hash = hashlib.sha256(payload.encode()).hexdigest()[:16]
    (ENT / "all.json").write_text(payload, encoding="utf-8")
    log(f"all.json: {len(payload)/1e6:.1f} MB, hash {content_hash}")

    # --- changelog: diff против предыдущего snapshot ---
    snap_path = LOG / "snapshot.json"
    prev = {}
    if snap_path.exists():
        try:
            prev = {e["id"]: e for e in json.loads(snap_path.read_text(encoding="utf-8"))}
        except Exception:
            prev = {}
    curr = {e["id"]: e for e in entities}

    def fp(e):
        return hashlib.sha1(json.dumps({k: e.get(k) for k in ("name", "aliases", "programs", "measures", "notes")},
                                        ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:12]

    added = [e for k, e in curr.items() if k not in prev]
    removed = [e for k, e in prev.items() if k not in curr]
    modified = []
    for k, e in curr.items():
        if k in prev and fp(e) != fp(prev[k]):
            modified.append({"id": k, "name": e["name"], "src": e["src"], "before": {f: prev[k].get(f) for f in ("programs", "notes")},
                             "after": {f: e.get(f) for f in ("programs", "notes")}})

    stamp = now.strftime("%Y-%m-%d")
    if prev and (added or removed or modified):
        change = {
            "ts": now.isoformat(),
            "date": stamp,
            "added": [{"id": e["id"], "name": e["name"], "src": e["src"], "type": e.get("type"), "programs": e.get("programs", [])} for e in added],
            "removed": [{"id": e["id"], "name": e["name"], "src": e["src"], "type": e.get("type")} for e in removed],
            "modified": modified,
            "counts": {"added": len(added), "removed": len(removed), "modified": len(modified)},
        }
        with (LOG / "changes.jsonl").open("a", encoding="utf-8") as f:
            f.write(json.dumps(change, ensure_ascii=False) + "\n")
        (LOG / "latest.json").write_text(json.dumps(change, ensure_ascii=False, indent=1), encoding="utf-8")
        log(f"changelog: +{len(added)} -{len(removed)} ~{len(modified)}")
    elif not prev:
        # первая сборка — журнал не раздуваем: фиксируем только факт baseline
        baseline = {"ts": now.isoformat(), "date": stamp, "baseline": True,
                    "counts": {"added": 0, "removed": 0, "modified": 0, "total": len(entities)}}
        (LOG / "latest.json").write_text(json.dumps(baseline, ensure_ascii=False, indent=1), encoding="utf-8")
        log("changelog: baseline")
    else:
        log("changelog: без изменений")

    snap_path.write_text(json.dumps([{"id": e["id"], "name": e["name"], "src": e["src"], "type": e.get("type"),
                                       "aliases": e.get("aliases", []), "programs": e.get("programs", []),
                                       "measures": e.get("measures", []), "notes": e.get("notes", "")} for e in entities],
                                      ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    # --- index.json ---
    by_type = {}
    by_country = {}
    by_measure = {}
    by_year = {}
    for e in entities:
        by_type[e.get("type", "org")] = by_type.get(e.get("type", "org"), 0) + 1
        for c in e.get("countries", []):
            by_country[c] = by_country.get(c, 0) + 1
        for m in e.get("measures", []):
            by_measure[m] = by_measure.get(m, 0) + 1
        y = (e.get("date") or "")[:4]
        if y:
            by_year[y] = by_year.get(y, 0) + 1

    index = {
        "generated_at": now.isoformat(),
        "date": stamp,
        "total": len(entities),
        "hash": content_hash,
        "sources": [{"code": c, **SOURCES_META[c], "count": sum(1 for e in entities if e["src"] == c)} for c in SOURCES_META],
        "by_type": by_type,
        "by_country": dict(sorted(by_country.items(), key=lambda x: -x[1])),
        "by_measure": by_measure,
        "by_year": dict(sorted(by_year.items())),
        "countries": sorted({c for e in entities for c in e.get("countries", [])}),
        "programs": sorted({p for e in entities for p in e.get("programs", [])}),
    }
    (ENT / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8")
    log(f"Готово за {time.time()-t0:.0f}s: {len(entities)} сущностей, {len(index['countries'])} стран")


if __name__ == "__main__":
    main()
