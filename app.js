/* SanctionsWatch — frontend logic. Vanilla JS, no build step. */
"use strict";

/* ---------- i18n ---------- */
const GRP_EN = {
  "Россия / Украина": "Russia / Ukraine", "Беларусь": "Belarus", "Иран": "Iran",
  "КНДР": "North Korea", "Терроризм": "Terrorism", "Наркотрафик": "Narcotics",
  "Кибер": "Cyber", "Magnitsky / права человека": "Magnitsky / human rights",
  "Сирия": "Syria", "Ирак": "Iraq", "Венесуэла": "Venezuela", "Куба": "Cuba",
  "Ливия": "Libya", "Йемен": "Yemen", "Сомали": "Somalia",
  "Судан / Юж. Судан": "Sudan / S. Sudan", "Мьянма": "Myanmar", "Афганистан": "Afghanistan",
  "Китай / Синьцзян / Гонконг": "China / Xinjiang / Hong Kong", "Балканы": "Balkans",
  "Никарагуа": "Nicaragua", "Зимбабве": "Zimbabwe",
  "Африка (Мали, ЦАР, Конго)": "Africa (Mali, CAR, DRC)", "Непролиферация": "Non-proliferation",
  "Морские / теневой флот": "Maritime / shadow fleet", "Прочие / без программы": "Other / no program",
};
const I18N = {
  ru: {
    nav_dash: "Обзор", nav_screen: "Скрининг", nav_batch: "Реестр", nav_log: "Изменения", nav_sources: "Источники",
    map_title: "География санкций",
    map_hint: "Страна = гражданство/регистрация субъекта (не страна-инициатор санкций). Насыщенность — число субъектов, логарифмическая шкала. Клик по стране — фильтр всего дашборда.",
    by_country: "Топ стран по числу записей",
    by_type: "Типы сущностей",
    measure_title: "Типы мер",
    measure_hint: "Блокировка — заморозка активов и полный запрет сделок; вторичные — риск санкций для третьих стран (подмножество блокирующих); non-SDN — ограничения отдельных операций (долг, акции, ценные бумаги)",
    m_blocking: "Блокировка активов", m_non_sdn: "non-SDN — ограниченные меры",
    m_ssi: "· SSI (секторальные)", m_cmic: "· NS-CMIC (ценные бумаги)",
    m_ns_plc: "· NS-PLC", m_capta: "· CAPTA", m_ns_mbs: "· NS-MBS (меню мер)",
    m_secondary: "Вторичные санкции",

    by_program: "Тематические программы · топ-15",
    meth_title: "Как читать цифры",
    meth_records: "записей в списках — каждое включение субъекта в каждый список считается отдельно (один человек в 6 списках = 6 записей)",
    meth_unique: "уникальных субъектов — оценка после дедупликации по имени и дате рождения между списками",
    meth_note: "Медийные цифры («20 000+ санкций») обычно дополнительно включают секторальные меры (эмбарго, экспортный контроль, ценовые потолки) и списки 30+ юрисдикций. Здесь — только персональные/корпоративные листинги 8 реестров.",
    total: "Всего записей", persons: "Физлица", entities: "Организации", vessels: "Суда", aircraft: "Воздушные суда",
    q_ph: "Имя, компания, судно, ИНН, IMO…",
    all_sources: "Все источники", all_types: "Все типы",
    log_title: "Журнал изменений списков",
    log_hint: "Каждое обновление пайплайна фиксирует, какие записи добавлены или удалены в каждом источнике. Это основа аудит-трейла. Полный перечень имён — в выгрузке CSV.",
    src_title: "Источники данных",
    src_note: "US (SDN + Consolidated non-SDN) / UK / UN загружаются напрямую из официальных реестров. EU / AU / JP / CA / CH — через нормализацию OpenSanctions (обновляется ежедневно из официальных списков). Скрининг для юридически значимых решений сверяйте с первоисточником.",
    foot_data: "Данные: OFAC · FCDO · ЕС · ООН · GAC · SECO · DFAT · MOF. Обновление ежедневно ночью (МСК).",
    generated: "срез от",
    results_n: "совпадений",
    searching: "поиск…",
    type_q: "Введите запрос для проверки — минимум 2 символа.",
    refine: "Уточнить", adv_year: "Год рождения", adv_dob: "Дата рождения", adv_dob_ph: "ДД.ММ.ГГГГ", adv_country: "Страна", adv_doc: "Документ / ИНН", adv_imo: "IMO / бортовой № (судно, самолёт)", adv_reset: "Сбросить", adv_any: "Любая",
    adv_hint: "Точное совпадение по документу, ИНН, IMO или бортовому/серийному номеру даёт 100% независимо от написания имени. Год или дата рождения отсекают записи с другой датой.",
    d_weak_aliases: "Слабые псевдонимы (OFAC)",
    weak_match: "Совпадение только по слабому псевдониму OFAC (weak aka) — высокий риск ложного срабатывания, обязательна сверка идентификаторов.",
    id_match: "Точное совпадение по идентификатору",
    no_results: "Совпадений не найдено.",
    no_results_sub: "Отсутствие совпадения в этом срезе не является юридическим заключением. Проверьте написание и альтернативные транслитерации.",
    select_hint: "Выберите запись слева, чтобы увидеть детали.",
    d_aliases: "Также известен как", d_countries: "Страны", d_programs: "Программы", d_ids: "Идентификаторы",
    d_dob: "Дата рождения", d_listed: "Включён в список", d_listed_os: "Отслеживается с (по данным агрегатора)", d_source: "Источник", d_type: "Тип",
    d_warn: "Совпадение по названию — это не совпадение объекта. Сверьте идентификаторы в карточке выше.",
    d_warn_person: "Совпадение по имени — это не совпадение личности. Сверьте дату рождения, серию и номер документа, адрес в карточке выше.",
    d_warn_entity: "Совпадение по названию — это не совпадение компании. Сверьте ИНН / регистрационный номер, юридический адрес и санкционные программы в карточке выше.",
    d_warn_vessel: "Совпадение по названию — это не совпадение судна: одноимённые суда (и серии «имя + номер») встречаются часто. Сверьте номер IMO в карточке выше — он не меняется при смене имени и флага. Проверить судно можно также по внешним базам выше.",
    d_warn_aircraft: "Совпадение по названию — это не совпадение воздушного судна. Сверьте бортовой (регистрационный) или серийный номер в карточке выше — он привязан к борту, а не к названию. Проверить борт можно также по внешним базам выше.",
    d_extcheck: "Проверить по номеру (внешние базы)",
    d_extcheck_note: "Позиция, статус и история — открываются в новой вкладке, внешние сайты.",
    t_person: "Физлицо", t_entity: "Организация", t_vessel: "Судно", t_aircraft: "Возд. судно", t_unknown: "Прочее",
    added: "добавлено", removed: "удалено", initial_load: "Первичная загрузка данных",
    log_csv: "Скачать CSV",
    country_unknown: "Без страны", lang_btn: "EN",
    col_name: "Название", col_count: "Записей", col_url: "URL", col_fmt: "Формат", col_status: "Статус",
    hs_ok: "OK", hs_stale: "кеш (сбой загрузки)", hs_failed: "недоступен", hs_checked: "Проверка источников",
    years_title: "Динамика включений по годам",
    years_hint: "Официальные даты — только UK (с 2020) и ООН (с 2001). Прокси — первое появление в мониторинге OpenSanctions (EU/AU/JP/CA/CH и суда США): записи до 2022 означают «не ранее», пик 2023 — старт трекинга агрегатора, а не всплеск санкций. OFAC историю дат не публикует.",
    years_official: "UK + ООН (официальные даты)",
    years_os: "Прокси (OpenSanctions, «не ранее»)",
    f_source: "Источник", f_type: "Тип", f_country: "Страна", f_program: "Программа",
    reset_all: "Сбросить всё", filters_loading: "фильтры: загрузка данных",
    click_to_filter: "клик — фильтр",
    b_title: "Пакетная проверка списка",
    b_hint: "Загрузите реестр контрагентов, судов или физлиц (XLSX, CSV) — каждая строка будет проверена по всем санкционным спискам. Колонки распознаются автоматически, перед запуском их можно скорректировать.",
    b_drop: "Перетащите файл сюда или нажмите для выбора",
    b_drop_sub: "XLSX, XLS или CSV — до 10 000 строк",
    b_tpl: "Скачать шаблон (XLSX)",
    b_privacy: "Файл обрабатывается целиком в вашем браузере и никуда не отправляется.",
    b_map_title: "Сопоставление колонок",
    b_map_name: "Название / ФИО (обязательно)",
    b_map_id: "Идентификатор (ИНН, IMO, бортовой)",
    b_map_dob: "Дата рождения",
    b_map_country: "Страна",
    b_map_skip: "— не использовать —",
    b_run: "Запустить проверку",
    b_back: "Назад",
    b_res_title: "Результаты проверки",
    b_export: "Скачать отчёт (XLSX)",
    b_again: "Новая проверка",
    b_st_match: "Совпадение", b_st_review: "Проверить вручную", b_st_clean: "Чисто",
    b_f_all: "Все",
    b_th_row: "Ваша запись", b_th_status: "Статус", b_th_score: "Скор",
    b_th_match: "Совпадение в списках", b_th_source: "Источник", b_th_type: "Тип",
    b_th_date: "Включён", b_th_programs: "Программы", b_th_measures: "Меры",
    b_shown: "показаны первые 300 из",
    b_rows: "строк",
    b_err: "Не удалось прочитать файл. Поддерживаются XLSX, XLS и CSV.",
    b_need_name: "Укажите колонку с названием или именем — без неё проверка невозможна.",
    b_wait: "Дождитесь загрузки данных…",
    b_running: "проверяю…",
    b_idm: "по идентификатору",
    b_match_none: "—",
  },
  en: {
    nav_dash: "Overview", nav_screen: "Screening", nav_batch: "Register", nav_log: "Changelog", nav_sources: "Sources",
    map_title: "Sanctions geography",
    map_hint: "Country = subject's citizenship/registration (not the sanctioning state). Intensity = number of subjects, log scale. Click a country to filter the whole dashboard.",
    by_country: "Top countries by entries",
    by_type: "Entity types",
    measure_title: "Measure types",
    measure_hint: "Blocking — asset freeze and full dealing ban; secondary — risk for third-country parties (subset of blocking); non-SDN — restrictions on specific dealings (debt, equity, securities)",
    m_blocking: "Asset blocking", m_non_sdn: "non-SDN — restricted dealings",
    m_ssi: "· SSI (sectoral)", m_cmic: "· NS-CMIC (securities)",
    m_ns_plc: "· NS-PLC", m_capta: "· CAPTA", m_ns_mbs: "· NS-MBS (menu-based)",
    m_secondary: "Secondary sanctions risk",

    by_program: "Thematic programs · top 15",
    meth_title: "How to read the numbers",
    meth_records: "list entries — each designation in each list is counted separately (one person in 6 lists = 6 entries)",
    meth_unique: "unique subjects — estimate after cross-list deduplication by name and date of birth",
    meth_note: "Media figures (\"20,000+ sanctions\") typically also count sectoral measures (embargoes, export controls, price caps) and 30+ jurisdictions. This dashboard covers personal/corporate listings from 8 registers only.",
    total: "Total entries", persons: "Individuals", entities: "Entities", vessels: "Vessels", aircraft: "Aircraft",
    q_ph: "Name, company, vessel, tax ID, IMO…",
    all_sources: "All sources", all_types: "All types",
    log_title: "List changelog",
    log_hint: "Every pipeline run records which entries were added or removed in each source. This is the audit-trail foundation. The CSV export contains the full list of names.",
    src_title: "Data sources",
    src_note: "US (SDN + Consolidated non-SDN) / UK / UN are fetched directly from official registers. EU / AU / JP / CA / CH come via OpenSanctions normalization (updated daily from official lists). For legally significant decisions, verify against the primary source.",
    foot_data: "Data: OFAC · FCDO · EU · UN · GAC · SECO · DFAT · MOF. Refreshed nightly (MSK).",
    generated: "snapshot",
    results_n: "matches",
    searching: "searching…",
    type_q: "Type a query to screen — at least 2 characters.",
    refine: "Refine", adv_year: "Birth year", adv_dob: "Date of birth", adv_dob_ph: "MM/DD/YYYY", adv_country: "Country", adv_doc: "Document / Tax ID", adv_imo: "IMO / tail no. (vessel, aircraft)", adv_reset: "Reset", adv_any: "Any",
    adv_hint: "An exact document, tax ID, IMO or tail/serial number match scores 100% regardless of name spelling. Birth year or full birth date filters out records with a different date.",
    d_weak_aliases: "Weak aliases (OFAC)",
    weak_match: "Match via an OFAC weak alias only — high false-positive risk, verify identifiers before treating as a hit.",
    id_match: "Exact identifier match",
    no_results: "No matches found.",
    no_results_sub: "Absence of a match in this snapshot is not a legal conclusion. Check spelling and alternative transliterations.",
    select_hint: "Select an entry on the left to see details.",
    d_aliases: "Also known as", d_countries: "Countries", d_programs: "Programs", d_ids: "Identifiers",
    d_dob: "Date of birth", d_listed: "Listed on", d_listed_os: "Tracked since (aggregator data)", d_source: "Source", d_type: "Type",
    d_warn: "A name match is not an identity match. Verify the identifiers in the record above.",
    d_warn_person: "A name match is not an identity match. Verify the date of birth, document series/number and address in the record above.",
    d_warn_entity: "A name match is not a company match. Verify the tax/registration number, registered address and sanctions programs in the record above.",
    d_warn_vessel: "A name match is not a vessel match: same-name vessels (and 'name + number' series) are common. Verify the IMO number in the record above — it never changes with name or flag. You can also check the vessel via the external databases above.",
    d_warn_aircraft: "A name match is not an aircraft match. Verify the tail (registration) or serial number in the record above — it is tied to the airframe, not the name. You can also check it via the external databases above.",
    d_extcheck: "Verify by number (external databases)",
    d_extcheck_note: "Position, status and history — open in a new tab, external sites.",
    t_person: "Individual", t_entity: "Entity", t_vessel: "Vessel", t_aircraft: "Aircraft", t_unknown: "Other",
    added: "added", removed: "removed", initial_load: "Initial data load",
    log_csv: "Download CSV",
    country_unknown: "No country", lang_btn: "RU",
    col_name: "Name", col_count: "Entries", col_url: "URL", col_fmt: "Format", col_status: "Status",
    hs_ok: "OK", hs_stale: "cache (fetch failed)", hs_failed: "unavailable", hs_checked: "Sources checked",
    years_title: "Listings by year",
    years_hint: "Official dates — UK (since 2020) and UN (since 2001) only. Proxy — first seen in OpenSanctions monitoring (EU/AU/JP/CA/CH and US vessels): entries before 2022 mean 'not earlier than'; the 2023 peak is the aggregator's tracking start, not a sanctions surge. OFAC does not publish designation dates.",
    years_official: "UK + UN (official dates)",
    years_os: "Proxy (OpenSanctions, 'not earlier than')",
    f_source: "Source", f_type: "Type", f_country: "Country", f_program: "Program",
    reset_all: "Reset all", filters_loading: "filters: loading data",
    click_to_filter: "click to filter",
    b_title: "Batch list screening",
    b_hint: "Upload a register of counterparties, vessels or individuals (XLSX, CSV) — every row is checked against all sanctions lists. Columns are detected automatically and can be adjusted before the run.",
    b_drop: "Drop a file here or click to browse",
    b_drop_sub: "XLSX, XLS or CSV — up to 10,000 rows",
    b_tpl: "Download template (XLSX)",
    b_privacy: "The file is processed entirely in your browser and is never uploaded anywhere.",
    b_map_title: "Column mapping",
    b_map_name: "Name (required)",
    b_map_id: "Identifier (tax ID, IMO, tail no.)",
    b_map_dob: "Date of birth",
    b_map_country: "Country",
    b_map_skip: "— skip —",
    b_run: "Run screening",
    b_back: "Back",
    b_res_title: "Screening results",
    b_export: "Download report (XLSX)",
    b_again: "New check",
    b_st_match: "Match", b_st_review: "Review manually", b_st_clean: "Clear",
    b_f_all: "All",
    b_th_row: "Your entry", b_th_status: "Status", b_th_score: "Score",
    b_th_match: "Matched record", b_th_source: "Source", b_th_type: "Type",
    b_th_date: "Listed", b_th_programs: "Programs", b_th_measures: "Measures",
    b_shown: "showing first 300 of",
    b_rows: "rows",
    b_err: "Could not read the file. XLSX, XLS and CSV are supported.",
    b_need_name: "Map the name column — screening is impossible without it.",
    b_wait: "Waiting for data to load…",
    b_running: "screening…",
    b_idm: "ID match",
    b_match_none: "—",
  },
};
let LANG = localStorage.getItem("sw_lang") || "ru";
const t = (k) => (I18N[LANG] && I18N[LANG][k]) || k;
const grp = (g) => (LANG === "en" ? (GRP_EN[g] || g) : g);
// ISO 3166-1 alpha-2 → localized country name via built-in Intl, fallback to code
let _cdn = null;
function countryName(code) {
  if (!code || code.length !== 2) return code;
  if (!_cdn || _cdn.lang !== LANG) {
    try { _cdn = { lang: LANG, dn: new Intl.DisplayNames([LANG], { type: "region" }) }; }
    catch { _cdn = { lang: LANG, dn: null }; }
  }
  try { return (_cdn.dn && _cdn.dn.of(code)) || code; } catch { return code; }
}

function applyI18n() {
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
  document.querySelectorAll("[data-i18n-title]").forEach((el) => (el.title = t(el.dataset.i18nTitle)));
  document.getElementById("langToggle").textContent = t("lang_btn");
}

function fillScreenSelects() {
  const fs = document.getElementById("fSource"), ft = document.getElementById("fType");
  const v1 = fs.value, v2 = ft.value;
  fs.innerHTML = `<option value="">${t("all_sources")}</option>` + SOURCES_ORDER.map((k) => `<option value="${k}">${k}</option>`).join("");
  ft.innerHTML = `<option value="">${t("all_types")}</option>` + ["person", "entity", "vessel", "aircraft"].map((k) => `<option value="${k}">${t("t_" + k)}</option>`).join("");
  fs.value = v1; ft.value = v2;
}

/* ---------- theme ---------- */
let THEME = localStorage.getItem("sw_theme") || "light";
const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
function applyTheme() {
  document.documentElement.dataset.theme = THEME;
  document.getElementById("themeToggle").innerHTML = THEME === "light" ? ICON_MOON : ICON_SUN;
}

/* ---------- data ---------- */
let STATS = null;   // precomputed snapshot (fast first paint)
let ALL = null;     // full records, needed for cross-filters
const SOURCES_ORDER = ["US", "UK", "EU", "UN", "CA", "CH", "AU", "JP"];
const SOURCE_FMT = { US: "XML / API", UK: "XML / CSV", EU: "XML / CSV", UN: "XML",
  CA: "XLSX→CSV", CH: "XML→CSV", AU: "XLSX→CSV", JP: "XLSX→CSV" };

async function loadStats() {
  STATS = await (await fetch("data/stats.json")).json();
}
let ALL_PROMISE = null;
function loadAll(onprogress) {
  if (!ALL_PROMISE)
    ALL_PROMISE = fetch("data/entities/all.json").then(async (r) => {
      const total = +r.headers.get("Content-Length") || 0;
      if (!r.body || !total) return r.json();
      const reader = r.body.getReader();
      const chunks = [];
      let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); got += value.length;
        if (onprogress) onprogress(got / total);
      }
      const buf = new Uint8Array(got);
      let off = 0;
      for (const c of chunks) { buf.set(c, off); off += c.length; }
      return JSON.parse(new TextDecoder().decode(buf));
    });
  return ALL_PROMISE;
}

/* ---------- program grouping (ported from pipeline) ---------- */
const PROGRAM_GROUPS = [
  ["Россия / Украина", /RUSSIA|UKRAINE|UKR\b|\bRUS\b|RUSDA|ロシア|クリミア|ウクライナ/i],
  ["Беларусь", /BELARUS|\bBLR\b/i],
  ["Иран", /IRAN|\bIRN\b|IFSR/i],
  ["КНДР", /DPRK|NORTH KOREA|KOREA|\bPRK\b/i],
  ["Терроризм", /SDGT|FTO|TERROR|AL-QA|ISIS|DAESH|ISIL|TALIBAN|TAQA|タリバーン|アル・カーイダ/i],
  ["Наркотрафик", /SDNT|NARCOTIC|TCO|FENTANYL|ILLICIT-DRUGS/i],
  ["Кибер", /CYBER|MALICIOUS CYBER/i],
  ["Magnitsky / права человека", /MAGNIT|GLOMAG|GLOBAL HUMAN RIGHTS|HRIT|\bHR\b/i],
  ["Сирия", /SYRIA|CAESAR|\bSYR\b|EO13894/i],
  ["Ирак", /IRAQ|\bIRQ\b/i],
  ["Венесуэла", /VENEZUELA|\bVEN\b/i],
  ["Куба", /CUBA/i],
  ["Ливия", /LIBYA|\bLYB\b/i],
  ["Йемен", /YEMEN|\bYEM\b/i],
  ["Сомали", /SOMALIA|\bSOM\b/i],
  ["Судан / Юж. Судан", /SUDAN|\bSDN\b/i],
  ["Мьянма", /MYANMAR|BURMA|\bMMR\b/i],
  ["Афганистан", /AFGHAN|\bAFG\b/i],
  ["Китай / Синьцзян / Гонконг", /XINJIANG|HONG KONG|HK-EO|CHINA|XPCC|CMIC/i],
  ["Балканы", /BALKAN|BOSNIA|SERBIA|KOSOVO/i],
  ["Никарагуа", /NICARAGUA|\bNIC\b/i],
  ["Зимбабве", /ZIMBABWE|\bZIM\b/i],
  ["Африка (Мали, ЦАР, Конго)", /MALI|CAR\b|CENTRAL AFRICAN|DRCONGO|\bCOD\b|CONGO/i],
  ["Непролиферация", /NPWMD|WMD|PROLIF|ITSR/i],
  ["Морские / теневой флот", /PIRACY|MARITIME|\(VESSELS\)|VESSELS\) -/i],
];
function programGroups(programs) {
  const text = (programs || []).join(" ");
  const out = [];
  for (const [g, rx] of PROGRAM_GROUPS) if (rx.test(text)) out.push(g);
  return out.length ? out : ["Прочие / без программы"];
}
/* стрagglers: редкие не-ISO значения стран из источников */
const COUNTRY_FIX = { "Tunisia": "TN", "Democratic People'S Republic Of Korea": "KP" };

/* ---------- cross-filters ---------- */
const FILTERS = { source: null, type: null, country: null, program: null };
const filtersActive = () => Object.values(FILTERS).some((v) => v !== null);

function filteredRecords() {
  if (!ALL) return null;
  return ALL.filter((e) => {
    if (FILTERS.source && e.source !== FILTERS.source) return false;
    if (FILTERS.type && e.type !== FILTERS.type) return false;
    if (FILTERS.country) {
      const cs = (e.countries && e.countries.length ? e.countries : ["ZZ"])
        .map((c) => COUNTRY_FIX[c] || c);
      if (!cs.includes(FILTERS.country)) return false;
    }
    if (FILTERS.program && !programGroups(e.programs).includes(FILTERS.program)) return false;
    return true;
  });
}

function computeStats(recs) {
  const bySource = {}, byType = {}, byCountry = {}, byProgram = {}, byMeasure = {};
  const uniq = new Set();
  for (const e of recs) {
    bySource[e.source] = (bySource[e.source] || 0) + 1;
    byType[e.type] = (byType[e.type] || 0) + 1;
    for (const c0 of (e.countries && e.countries.length ? e.countries : ["ZZ"])) {
      const c = COUNTRY_FIX[c0] || c0;
      byCountry[c] = (byCountry[c] || 0) + 1;
    }
    for (const g of programGroups(e.programs))
      byProgram[g] = (byProgram[g] || 0) + 1;
    for (const m of (e.measures && e.measures.length ? e.measures : ["blocking"]))
      byMeasure[m] = (byMeasure[m] || 0) + 1;
    uniq.add(e.key + "|" + (e.dob || ""));
  }
  const byYearOff = {}, byYearOs = {};
  for (const e of recs) {
    if (!e.listed_on) continue;
    const y = e.listed_on.slice(0, 4);
    (e.listed_on_kind === "official" ? byYearOff : byYearOs)[y] =
      ((e.listed_on_kind === "official" ? byYearOff : byYearOs)[y] || 0) + 1;
  }
  const sortY = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => a[0].localeCompare(b[0])));
  const sort = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]));
  return { total: recs.length, unique_subjects: uniq.size,
    by_source: sort(bySource), by_type: sort(byType),
    by_country: sort(byCountry), by_program: sort(byProgram),
    by_measure: sort(byMeasure),
    by_year_official: sortY(byYearOff), by_year_os: sortY(byYearOs),
    sources: STATS.sources, generated_at: STATS.generated_at };
}

function curStats() {
  if (ALL && filtersActive()) return computeStats(filteredRecords());
  if (ALL && ALL.length) { const s = computeStats(ALL); return s; }
  return STATS;
}

function setFilter(key, value) {
  FILTERS[key] = FILTERS[key] === value ? null : value;
  renderDashboard();
}

function renderChips() {
  const box = document.getElementById("chips");
  if (!ALL) {
    box.innerHTML = "";
    return;
  }
  if (!filtersActive()) { box.innerHTML = ""; return; }
  const labels = {
    source: [t("f_source"), FILTERS.source],
    type: [t("f_type"), t("t_" + FILTERS.type)],
    country: [t("f_country"), FILTERS.country === "ZZ" ? t("country_unknown") : countryName(FILTERS.country)],
    program: [t("f_program"), grp(FILTERS.program)],
  };
  box.innerHTML = Object.keys(labels).filter((k) => FILTERS[k]).map((k) =>
    `<span class="chip"><span class="k">${labels[k][0]}</span>${esc(String(labels[k][1]))}
     <button data-f="${k}" aria-label="×">×</button></span>`).join("") +
    `<button class="reset">${t("reset_all")}</button>`;
  box.querySelectorAll(".chip button").forEach((b) =>
    b.addEventListener("click", () => { FILTERS[b.dataset.f] = null; renderDashboard(); }));
  box.querySelector(".reset").addEventListener("click", () => {
    Object.keys(FILTERS).forEach((k) => (FILTERS[k] = null)); renderDashboard();
  });
}

/* ---------- router ---------- */
const ROUTES = ["dashboard", "screening", "batch", "changelog", "sources"];
function route() {
  const r = (location.hash.replace("#/", "") || "dashboard").split("?")[0];
  const view = ROUTES.includes(r) ? r : "dashboard";
  ROUTES.forEach((x) => document.getElementById("view-" + x).classList.toggle("active", x === view));
  document.querySelectorAll(".nav a").forEach((a) => a.classList.toggle("active", a.dataset.route === view));
  syncNavScroll();
  if (view === "changelog") renderChangelog();
  if (view === "screening") {
    // сквозные фильтры дашборда → селекты скрининга
    if (FILTERS.source) document.getElementById("fSource").value = FILTERS.source;
    if (FILTERS.type) document.getElementById("fType").value = FILTERS.type;
  }
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

// плашка разделов: тени-намёки, когда не влезает, и докрутка до активной вкладки
function syncNavScroll() {
  const nav = document.getElementById("nav"), wrap = document.getElementById("navwrap");
  if (!nav || !wrap) return;
  wrap.classList.toggle("scr", nav.scrollWidth > nav.clientWidth + 2);
  const act = nav.querySelector("a.active");
  if (act) act.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  // sticky-панель фильтров липнет вплотную под шапкой (высота шапки меняется на мобильном)
  const hdr = document.querySelector(".top"), ch = document.getElementById("chips");
  if (hdr && ch) ch.style.top = hdr.getBoundingClientRect().height + "px";
}
window.addEventListener("resize", syncNavScroll);

/* ---------- dashboard ---------- */
const fmt = new Intl.NumberFormat("ru-RU");
const interactive = () => !!ALL; // фильтры работают после загрузки полного среза

function renderDashboard() {
  const s = curStats();
  document.getElementById("updated").textContent =
    `${t("generated")} ${new Date(s.generated_at).toLocaleString(LANG === "ru" ? "ru-RU" : "en-GB")}`;
  document.getElementById("footGen").textContent = `© SanctionsWatch · ${s.generated_at.slice(0, 10)}`;
  renderChips();

  // stat cards (источники кликабельны)
  const cards = [{ n: s.total, l: t("total"), cls: "" }];
  for (const src of SOURCES_ORDER)
    cards.push({ n: s.by_source[src] || 0, l: src, cls: "src", src });
  const st = document.getElementById("statrow");
  const infoTip =
    `<b>${fmt.format(s.total)}</b> — ${t("meth_records")}<br><br>` +
    `<b>${fmt.format(s.unique_subjects || 0)}</b> — ${t("meth_unique")}<br><br>${t("meth_note")}`;
  st.innerHTML = cards.map((c, i) =>
    `<div class="stat ${c.cls}${interactive() && c.src ? " clickable" : ""}${FILTERS.source === c.src && c.src ? " on" : ""}" data-i="${i}">
      <div class="n">${fmt.format(c.n)}</div>
      <div class="l">${c.l}${i === 0 ? ` <button class="info-i" type="button" aria-label="${esc(t("meth_title"))}">i</button>` : ""}</div>
      ${i === 0 ? `<span class="info-tip" role="tooltip">${infoTip}</span>` : ""}</div>`).join("");
  const infoBtn = st.querySelector(".info-i");
  if (infoBtn) {
    const tip = st.querySelector(".info-tip");
    let hideTimer = null;
    const place = () => {
      const r = infoBtn.getBoundingClientRect();
      tip.style.left = Math.max(8, Math.min(r.left - 150, innerWidth - 336)) + "px";
      tip.style.top = (r.bottom + 8) + "px";
    };
    const show = () => { clearTimeout(hideTimer); place(); tip.classList.add("show"); };
    const hide = () => { hideTimer = setTimeout(() => tip.classList.remove("show"), 160); };
    infoBtn.addEventListener("mouseenter", show);
    infoBtn.addEventListener("mouseleave", hide);
    tip.addEventListener("mouseenter", show);
    tip.addEventListener("mouseleave", hide);
    infoBtn.addEventListener("click", (e) => { e.stopPropagation(); show(); });
    document.addEventListener("click", () => tip.classList.remove("show"));
  }
  if (interactive())
    st.querySelectorAll(".stat.clickable").forEach((el) =>
      el.addEventListener("click", () => setFilter("source", cards[+el.dataset.i].src)));

  // types — compact bar rows (same style as countries/programs)
  const typeMeta = [["person", t("persons")], ["entity", t("entities")], ["vessel", t("vessels")], ["aircraft", t("aircraft")]];
  const tmax = Math.max(1, ...typeMeta.map(([k]) => s.by_type[k] || 0));
  const tc = document.getElementById("typeChart");
  tc.innerHTML = typeMeta.map(([k, l]) => {
    const n = s.by_type[k] || 0;
    return `<div class="bar-row type${interactive() ? " clickable" : ""}${FILTERS.type === k ? " on" : FILTERS.type ? " dim" : ""}" data-type="${k}" title="${l}: ${fmt.format(n)}">
      <span class="cc">${l}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${(n / tmax) * 100}%"></span></span>
      <span class="v">${fmt.format(n)}</span></div>`;
  }).join("");
  if (interactive())
    tc.querySelectorAll(".bar-row.clickable").forEach((el) =>
      el.addEventListener("click", () => setFilter("type", el.dataset.type)));

  // countries bars
  const cc = Object.entries(s.by_country).filter(([k]) => k !== "ZZ").slice(0, 15);
  const cmax = cc.length ? cc[0][1] : 1;
  const cCh = document.getElementById("countryChart");
  cCh.innerHTML = cc.map(([c, n]) =>
    `<div class="bar-row cty${interactive() ? " clickable" : ""}${FILTERS.country === c ? " on" : FILTERS.country ? " dim" : ""}" data-c="${c}" title="${esc(countryName(c))} (${c}): ${fmt.format(n)}">
      <span class="cc">${esc(countryName(c))}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${(n / cmax) * 100}%"></span></span>
      <span class="v">${fmt.format(n)}</span></div>`).join("");
  if (interactive())
    cCh.querySelectorAll(".bar-row.clickable").forEach((el) =>
      el.addEventListener("click", () => setFilter("country", el.dataset.c)));

  // programs
  const progs = Object.entries(s.by_program || {}).slice(0, 15);
  const pmax = progs.length ? progs[0][1] : 1;
  const pCh = document.getElementById("programChart");
  pCh.innerHTML = progs.map(([g, n]) =>
    `<div class="bar-row prog${interactive() ? " clickable" : ""}${FILTERS.program === g ? " on" : FILTERS.program ? " dim" : ""}" data-p="${esc(g)}" title="${esc(grp(g))}: ${fmt.format(n)}">
      <span class="cc">${esc(grp(g))}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${(n / pmax) * 100}%"></span></span>
      <span class="v">${fmt.format(n)}</span></div>`).join("");
  if (interactive())
    pCh.querySelectorAll(".bar-row.clickable").forEach((el) =>
      el.addEventListener("click", () => setFilter("program", el.dataset.p)));

  // measures (blocking / secondary / non-SDN; подтипы non-SDN — в подсказке)
  const bm = s.by_measure || {};
  const mc = document.getElementById("measureChart");
  const sub = ["ssi", "cmic", "ns_plc", "capta", "ns_mbs"].filter((k) => bm[k]);
  const subTitle = sub.map((k) => `${t("m_" + k).replace(/^· /, "")}: ${fmt.format(bm[k])}`).join("\n");
  const mEntries = ["blocking", "secondary", "non_sdn"].filter((k) => bm[k]).map((k) => [k, bm[k]]);
  if (mEntries.length) {
    const mmax = Math.max(...mEntries.map(([, n]) => n));
    mc.innerHTML = mEntries.map(([k, n]) =>
      `<div class="bar-row type" title="${t("m_" + k)}: ${fmt.format(n)}${k === "non_sdn" && subTitle ? "\n" + subTitle : ""}">
        <span class="cc">${t("m_" + k)}</span>
        <span class="bar-track"><span class="bar-fill${k !== "blocking" ? " amber" : ""}" style="width:${(n / mmax) * 100}%"></span></span>
        <span class="v">${fmt.format(n)}</span></div>`).join("");
  } else {
    mc.innerHTML = `<span class="muted small">${t("filters_loading")}…</span>`;
  }
