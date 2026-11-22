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
    r_f_all: "Все", r_f_hi: "Совпадение", r_f_md: "Проверить", r_f_lo: "Слабые",
    searching: "поиск…",
    type_q: "Введите запрос для проверки — минимум 2 символа.",
    refine: "Уточнить", adv_dob: "Дата / год рождения", adv_dob_ph: "ДД.ММ.ГГГГ / ГГГГ", adv_country: "Страна", adv_doc: "Документ / ИНН", adv_imo: "IMO / бортовой №", adv_reset: "Сбросить", adv_any: "Любая",
    adv_tip_country: "Страна по данным санкционных списков: гражданство, регистрация или порт приписки. У одной записи может быть несколько стран.",
    adv_tip_dob: "Можно ввести год (1966) или полную дату (25.03.1966). Записи без даты рождения не отсекаются.",
    adv_tip_doc: "Паспорт, нац. ID, ИНН — точное совпадение по номеру даёт 100% независимо от написания имени.",
    adv_tip_imo: "IMO судна или бортовой/серийный номер самолёта — точное совпадение даёт 100% независимо от названия.",
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
    r_f_all: "All", r_f_hi: "Match", r_f_md: "Review", r_f_lo: "Weak",
    searching: "searching…",
    type_q: "Type a query to screen — at least 2 characters.",
    refine: "Refine", adv_dob: "Birth date / year", adv_dob_ph: "MM/DD/YYYY / YYYY", adv_country: "Country", adv_doc: "Document / Tax ID", adv_imo: "IMO / tail no.", adv_reset: "Reset", adv_any: "Any",
    adv_tip_country: "Country as recorded in the sanctions lists: citizenship, registration or port of registry. A record may list several countries.",
    adv_tip_dob: "Enter a year (1966) or a full date (03/25/1966). Records without a birth date are not excluded.",
    adv_tip_doc: "Passport, national ID, tax ID — an exact number match scores 100% regardless of name spelling.",
    adv_tip_imo: "Vessel IMO or aircraft tail/serial number — an exact match scores 100% regardless of the name.",
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
// мини-флаги источников (lipis flag-icons 4x3, UN — упрощённый) — ~5.4 КБ инлайн
const FLAGS = {"US": '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-us" viewBox="0 0 640 480"><path fill="#bd3d44" d="M0 0h640v480H0"/><path stroke="#fff" stroke-width="37" d="M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640"/><path fill="#192f5d" d="M0 0h364.8v258.5H0"/><marker id="us-a" markerHeight="30" markerWidth="30"><path fill="#fff" d="m14 0 9 27L0 10h28L5 27z"/></marker><path fill="none" marker-mid="url(#us-a)" d="m0 0 16 11h61 61 61 61 60L47 37h61 61 60 61L16 63h61 61 61 61 60L47 89h61 61 60 61L16 115h61 61 61 61 60L47 141h61 61 60 61L16 166h61 61 61 61 60L47 192h61 61 60 61L16 218h61 61 61 61 60z"/></svg>', "UK": '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-gb" viewBox="0 0 640 480"><path fill="#012169" d="M0 0h640v480H0z"/><path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0z"/><path fill="#C8102E" d="m424 281 216 159v40L369 281zm-184 20 6 35L54 480H0zM640 0v3L391 191l2-44L590 0zM0 0l239 176h-60L0 42z"/><path fill="#FFF" d="M241 0v480h160V0zM0 160v160h640V160z"/><path fill="#C8102E" d="M0 193v96h640v-96zM273 0v480h96V0z"/></svg>', "EU": '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="flag-icons-eu" viewBox="0 0 640 480"><defs><g id="eu-d"><g id="eu-b"><path id="eu-a" d="m0-1-.3 1 .5.1z"/><use xlink:href="#eu-a" transform="scale(-1 1)"/></g><g id="eu-c"><use xlink:href="#eu-b" transform="rotate(72)"/><use xlink:href="#eu-b" transform="rotate(144)"/></g><use xlink:href="#eu-c" transform="scale(-1 1)"/></g></defs><path fill="#039" d="M0 0h640v480H0z"/><g fill="#fc0" transform="translate(320 242.3)scale(23.7037)"><use xlink:href="#eu-d" width="100%" height="100%" y="-6"/><use xlink:href="#eu-d" width="100%" height="100%" y="6"/><g id="eu-e"><use xlink:href="#eu-d" width="100%" height="100%" x="-6"/><use xlink:href="#eu-d" width="100%" height="100%" transform="rotate(-144 -2.3 -2.1)"/><use xlink:href="#eu-d" width="100%" height="100%" transform="rotate(144 -2.1 -2.3)"/><use xlink:href="#eu-d" width="100%" height="100%" transform="rotate(72 -4.7 -2)"/><use xlink:href="#eu-d" width="100%" height="100%" transform="rotate(72 -5 .5)"/></g><use xlink:href="#eu-e" width="100%" height="100%" transform="scale(-1 1)"/></g></svg>', "CA": '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-ca" viewBox="0 0 640 480"><path fill="#fff" d="M150.1 0h339.7v480H150z"/><path fill="#d52b1e" d="M-19.7 0h169.8v480H-19.7zm509.5 0h169.8v480H489.9zM201 232l-13.3 4.4 61.4 54c4.7 13.7-1.6 17.8-5.6 25l66.6-8.4-1.6 67 13.9-.3-3.1-66.6 66.7 8c-4.1-8.7-7.8-13.3-4-27.2l61.3-51-10.7-4c-8.8-6.8 3.8-32.6 5.6-48.9 0 0-35.7 12.3-38 5.8l-9.2-17.5-32.6 35.8c-3.5.9-5-.5-5.9-3.5l15-74.8-23.8 13.4q-3.2 1.3-5.2-2.2l-23-46-23.6 47.8q-2.8 2.5-5 .7L264 130.8l13.7 74.1c-1.1 3-3.7 3.8-6.7 2.2l-31.2-35.3c-4 6.5-6.8 17.1-12.2 19.5s-23.5-4.5-35.6-7c4.2 14.8 17 39.6 9 47.7"/></svg>', "CH": '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-ch" viewBox="0 0 640 480"><g fill-rule="evenodd" stroke-width="1pt"><path fill="red" d="M0 0h640v480H0z"/><g fill="#fff"><path d="M170 195h300v90H170z"/><path d="M275 90h90v300h-90z"/></g></g></svg>', "AU": '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-au" viewBox="0 0 640 480"><path fill="#00008B" d="M0 0h640v480H0z"/><path fill="#fff" d="m37.5 0 122 90.5L281 0h39v31l-120 89.5 120 89V240h-40l-120-89.5L40.5 240H0v-30l119.5-89L0 32V0z"/><path fill="red" d="M212 140.5 320 220v20l-135.5-99.5zm-92 10 3 17.5-96 72H0zM320 0v1.5l-124.5 94 1-22L295 0zM0 0l119.5 88h-30L0 21z"/><path fill="#fff" d="M120.5 0v240h80V0zM0 80v80h320V80z"/><path fill="red" d="M0 96.5v48h320v-48zM136.5 0v240h48V0z"/><path fill="#fff" d="m527 396.7-20.5 2.6 2.2 20.5-14.8-14.4-14.7 14.5 2-20.5-20.5-2.4 17.3-11.2-10.9-17.5 19.6 6.5 6.9-19.5 7.1 19.4 19.5-6.7-10.7 17.6zm-3.7-117.2 2.7-13-9.8-9 13.2-1.5 5.5-12.1 5.5 12.1 13.2 1.5-9.8 9 2.7 13-11.6-6.6zm-104.1-60-20.3 2.2 1.8 20.3-14.4-14.5-14.8 14.1 2.4-20.3-20.2-2.7 17.3-10.8-10.5-17.5 19.3 6.8L387 178l6.7 19.3 19.4-6.3-10.9 17.3 17.1 11.2ZM623 186.7l-20.9 2.7 2.3 20.9-15.1-14.7-15 14.8 2.1-21-20.9-2.4 17.7-11.5-11.1-17.9 20 6.7 7-19.8 7.2 19.8 19.9-6.9-11 18zm-96.1-83.5-20.7 2.3 1.9 20.8-14.7-14.8-15.1 14.4 2.4-20.7-20.7-2.8 17.7-11L467 73.5l19.7 6.9 7.3-19.5 6.8 19.7 19.8-6.5-11.1 17.6zM234 385.7l-45.8 5.4 4.6 45.9-32.8-32.4-33 32.2 4.9-45.9-45.8-5.8 38.9-24.8-24-39.4 43.6 15 15.8-43.4 15.5 43.5 43.7-14.7-24.3 39.2 38.8 25.1Z"/></svg>', "JP": '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-jp" viewBox="0 0 640 480"><defs><clipPath id="jp-a"><path fill-opacity=".7" d="M-88 32h640v480H-88z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#jp-a)" transform="translate(88 -32)"><path fill="#fff" d="M-128 32h720v480h-720z"/><circle cx="523.1" cy="344.1" r="194.9" fill="#bc002d" transform="translate(-168.4 8.6)scale(.76554)"/></g></svg>', "UN": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><rect width="640" height="480" fill="#5b92e5"/><g fill="none" stroke="#fff" stroke-width="14"><circle cx="320" cy="200" r="110"/><ellipse cx="320" cy="200" rx="46" ry="110"/><path d="M320 90v220M215 165h210M215 235h210"/><path d="M120 330c40 60 110 90 200 90M520 330c-40 60-110 90-200 90"/></g><g fill="#fff"><circle cx="150" cy="300" r="12"/><circle cx="185" cy="345" r="12"/><circle cx="230" cy="378" r="12"/><circle cx="490" cy="300" r="12"/><circle cx="455" cy="345" r="12"/><circle cx="410" cy="378" r="12"/></g></svg>'};
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
/* не-ISO значения стран из источников (UK OFSI и OFAC пишут страны строками) → ISO 3166-1 alpha-2.
   Ключи сравниваются через norm() — регистр и знаки не важны. Спорные регионы без однозначного
   кода (Kafia Kingi, Jammu And Kashmir, «Congo», «Former Soviet Union», Csxx/Yucs/Suhh) не маппим. */
const COUNTRY_FIX_RAW = {
  "Tunisia": "TN", "Algeria": "DZ", "Maldives": "MV", "Seychelles": "SC",
  "Morocco": "MA", "Mauritania": "MR", "Mauritius": "MU", "Comoros": "KM",
  "Democratic People'S Republic Of Korea": "KP", "Dprk": "KP", "Korea, South": "KR",
  "Congo (Democratic Republic)": "CD", "Congo, Republic Of The": "CG",
  "Iran (Islamic Republic Of)": "IR", "Region: Iran": "IR",
  "Saint Kitts And Nevis": "KN", "Saint Vincent And The Grenadines": "VC", "Saint Lucia": "LC",
  "The Gambia": "GM", "Dominica": "DM", "Guyana": "GY", "Suriname": "SR",
  "United Kingdom Of Great Britain And Northern Ireland": "GB", "Gb-Nir": "GB",
  "United States Of America": "US",
  "North Macedonia, The Republic Of": "MK", "Sierra Leone": "SL", "Benin": "BJ",
  "Palau": "PW", "Jersey": "JE", "Guernsey": "GG", "Man, Isle Of": "IM", "Gibraltar": "GI",
  "Cote D Ivoire": "CI", "Djibouti": "DJ", "Turkmenistan": "TM",
  "Vanuatu": "VU", "United Republic Of Tanzania": "TZ", "Barbados": "BB", "Namibia": "NA",
  "Bermuda": "BM", "Antigua And Barbuda": "AG", "Macau": "MO", "Bahamas, The": "BS",
  "Cape Verde": "CV", "Cabo Verde": "CV",
  "Palestinian": "PS", "Occupied Palestinian Territories": "PS", "State Of Palestine": "PS",
  "West Bank": "PS", "Region: Gaza": "PS", "Region: West Bank": "PS",
  "Region: North Gaza": "PS", "Region: Northern Gaza": "PS",
  "Region: Russia": "RU", "Region: Crimea": "UA", "Ua-Lpr": "UA",
  "Region: Northern Mali": "ML",
  "Curacao": "CW", "Aruba": "AW", "Iceland": "IS", "Samoa": "WS", "San Marino": "SM",
  "Viet Nam": "VN", "Madagascar": "MG",
  "China, Hong Kong Special Administrative Region": "HK",
};
const COUNTRY_FIX = {};
for (const [k, v] of Object.entries(COUNTRY_FIX_RAW)) COUNTRY_FIX[norm(k)] = v;
function fixCountry(c) { return COUNTRY_FIX[norm(c)] || c; }

/* ---------- cross-filters ---------- */
const FILTERS = { source: null, type: null, country: null, program: null };
const filtersActive = () => Object.values(FILTERS).some((v) => v !== null);

function filteredRecords() {
  if (!ALL) return null;
  return ALL.filter((e) => {
    if (FILTERS.source && e.source !== FILTERS.source) return false;
    if (FILTERS.type && e.type !== FILTERS.type) return false;
    if (FILTERS.country) {
      const cs = (e.countries && e.countries.length ? e.countries : ["ZZ"]).map(fixCountry);
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
      const c = fixCountry(c0);
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
    `<div class="stat ${c.cls}${interactive() && c.src ? " clickable" : ""}${FILTERS.source === c.src && c.src ? " on" : ""}" data-i="${i}" data-src="${c.src || ""}">
      <div class="n">${fmt.format(c.n)}</div>
      <div class="l">${c.src ? `<span class="flagchip" aria-hidden="true">${FLAGS[c.src] || ""}</span>` : ""}${c.l}${i === 0 ? `<button class="info-i" type="button" aria-label="${esc(t("meth_title"))}"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="12" y1="10.5" x2="12" y2="16.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="7.2" r="1.3" fill="currentColor"/></svg></button>` : ""}</div>
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
  // тултипы с полными названиями источников: hover на десктопе, long-press на тач-устройствах
  let srcTip = window.__srcTip;
  if (!srcTip) {
    srcTip = document.createElement("span");
    srcTip.className = "info-tip src-tip";
    document.body.appendChild(srcTip);
    srcTip.addEventListener("mouseenter", () => clearTimeout(window.__srcTipHideT));
    srcTip.addEventListener("mouseleave", () => { window.__srcTipHideT = setTimeout(() => srcTip.classList.remove("show"), 160); });
    document.addEventListener("click", (e) => { if (!e.target.closest(".stat.src")) srcTip.classList.remove("show"); });
    window.__srcTip = srcTip;
  }
  srcTip.classList.remove("show");
  const showSrcTip = (el) => {
    if (!el.isConnected) return;
    const k = el.dataset.src;
    srcTip.textContent = (STATS.sources[k] && STATS.sources[k].name) || k;
    const r = el.getBoundingClientRect();
    srcTip.style.left = Math.max(8, Math.min(r.left, innerWidth - 336)) + "px";
    srcTip.style.top = (r.bottom + 6) + "px";
    srcTip.classList.add("show");
  };
  st.querySelectorAll(".stat.src").forEach((el) => {
    let hoverT = null, lpTimer = null, lpFired = false;
    el.addEventListener("mouseenter", () => {
      if (!matchMedia("(hover: hover)").matches) return;
      clearTimeout(window.__srcTipHideT);
      hoverT = setTimeout(() => showSrcTip(el), 200);
    });
    el.addEventListener("mouseleave", () => {
      clearTimeout(hoverT);
      window.__srcTipHideT = setTimeout(() => srcTip.classList.remove("show"), 160);
    });
    el.addEventListener("touchstart", () => {
      lpFired = false;
      clearTimeout(lpTimer);
      lpTimer = setTimeout(() => { lpFired = true; showSrcTip(el); }, 500);
    }, { passive: true });
    el.addEventListener("touchmove", () => clearTimeout(lpTimer), { passive: true });
    el.addEventListener("touchend", () => {
      clearTimeout(lpTimer);
      if (lpFired) window.__srcTipHideT = setTimeout(() => srcTip.classList.remove("show"), 2000);
    });
    el.addEventListener("click", (e) => {
      if (lpFired) { lpFired = false; e.preventDefault(); e.stopImmediatePropagation(); }
    });
  });

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

  // listings by year: официальные даты (UK/UN) + прокси first_seen (остальные)
  const yc = document.getElementById("yearChart");
  if (yc && (s.by_year_official || s.by_year_os)) {
    const off = s.by_year_official || {}, os = s.by_year_os || {};
    const years = [...new Set([...Object.keys(off), ...Object.keys(os)])].sort();
    const tot = (y) => (off[y] || 0) + (os[y] || 0);
    const max = Math.max(1, ...years.map(tot));
    const lastY = +years[years.length - 1];
    const lastLabeled = Math.floor(lastY / 5) * 5; // ближайший «круглый» год снизу
    yc.innerHTML =
      `<div class="ygrid">` + years.map((y) => {
        const o = off[y] || 0, p = os[y] || 0, sum = o + p;
        const bh = Math.sqrt(sum / max) * 100; // sqrt-шкала: 2023 не забивает мелкие годы
        const offH = sum ? (o / sum) * 100 : 0;
        // подпись — на круглых годах; последний год — только если не слипается с круглой подписью
        const showLab = (+y % 5 === 0) || (+y === lastY && lastY - lastLabeled > 2);
        const kv = sum >= 1000 ? (Math.round(sum / 100) / 10).toString().replace(".", LANG === "ru" ? "," : ".") + "k" : (sum || "");
        return `<div class="ycol" title="${y}: ${t("years_official")} — ${fmt.format(o)}; ${t("years_os")} — ${fmt.format(p)}">
          <div class="ybars"><div class="yval" style="bottom:calc(${bh}% + 2px)">${kv}</div><div class="ybar" style="height:${bh}%">
            <div class="yseg os" style="height:${100 - offH}%"></div>
            <div class="yseg off" style="height:${offH}%"></div>
          </div></div>
          <div class="ytick${showLab ? " big" : ""}"></div>
          <div class="ylab">${showLab ? y : ""}</div>
        </div>`;
      }).join("") +
      `</div>
       <div class="ylegend">
         <span><i class="ysw off"></i>${t("years_official")}</span>
         <span><i class="ysw os"></i>${t("years_os")}</span>
       </div>`;
  }

  renderMap(s);
}

/* ---------- world map ---------- */
let GEO = null;
const mapState = { counts: {}, max: 1 };
function proj(lon, lat) {
  return [((lon + 180) / 360) * 1000, ((85 - lat) / 145) * 470];
}
function ringToPath(ring) {
  let d = "";
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = proj(ring[i][0], ring[i][1]);
    d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d + "Z";
}
function geomToPath(g) {
  if (!g) return "";
  if (g.type === "Polygon") return g.coordinates.map(ringToPath).join("");
  if (g.type === "MultiPolygon") return g.coordinates.map((p) => p.map(ringToPath).join("")).join("");
  return "";
}
async function loadGeo() {
  if (GEO) return GEO;
  GEO = await (await fetch("data/countries.geo.json")).json();
  return GEO;
}
function mapFill(n) {
  if (!n) return { cls: "d0", op: null };
  const tt = Math.log10(n + 1) / Math.log10(mapState.max + 1);
  return { cls: "dn", op: (0.18 + 0.82 * tt).toFixed(2) };
}
async function renderMap(s) {
  const svg = document.getElementById("worldmap");
  const tip = document.getElementById("mapTip");
  await loadGeo();
  mapState.counts = s.by_country || {};
  mapState.max = Math.max(1, ...Object.entries(mapState.counts)
    .filter(([k]) => k.length === 2 && k !== "ZZ").map(([, v]) => v));
  document.getElementById("mapMax").textContent = fmt.format(mapState.max);
  svg.classList.toggle("filterable", interactive());
  svg.classList.toggle("hascountry", !!FILTERS.country); // выбранная страна: яркая заливка, остальные приглушены
  svg.innerHTML = GEO.features.map((f) => {
    const iso = f.properties.iso2;
    const n = iso ? (mapState.counts[iso] || 0) : 0;
    const fl = mapFill(n);
    const sel = FILTERS.country && FILTERS.country === iso ? " on" : "";
    return `<path class="${fl.cls}${sel}"${fl.op ? ` fill-opacity="${fl.op}"` : ""}
      data-iso="${iso || ""}" data-name="${esc(f.properties.name)}" data-n="${n}"
      d="${geomToPath(f.geometry)}"/>`;
  }).join("");

  svg.querySelectorAll("path").forEach((p) => {
    p.addEventListener("mousemove", (ev) => {
      const iso = p.dataset.iso;
      if (!iso) return;
      p.classList.add("hover");
      const wrap = svg.closest(".mapwrap").getBoundingClientRect();
      const n = +p.dataset.n;
      tip.innerHTML = `<div class="tt-name">${esc(countryName(iso) !== iso ? countryName(iso) : p.dataset.name)} <span class="muted">${iso}</span></div>
        <span class="tt-n">${fmt.format(n)}</span> ${t("total").toLowerCase()}
        ${interactive() ? `<div class="tt-hint">${t("click_to_filter")}</div>` : ""}`;
      tip.style.display = "block";
      let tx = ev.clientX - wrap.left + 14, ty = ev.clientY - wrap.top + 12;
      if (tx + 250 > wrap.width) tx -= 270;
      if (ty + 90 > wrap.height) ty -= 100;
      tip.style.left = tx + "px"; tip.style.top = ty + "px";
    });
    p.addEventListener("mouseleave", () => { p.classList.remove("hover"); tip.style.display = "none"; });
    if (interactive())
      p.addEventListener("click", () => {
        tip.style.display = "none";
        if (p.dataset.iso) setFilter("country", p.dataset.iso);
      });
  });
}

/* ---------- normalization & matching ---------- */
const CYR2LAT = {
  а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",
  н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",
  ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",
};
function translit(s) {
  return s.split("").map((c) => CYR2LAT[c] || c).join("");
}
function norm(s) {
  return (s || "").toLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036F]/g, "").replace(/[^a-z0-9\u0400-\u04FF]+/g, " ").trim();
}
function tokens(s) { return norm(s).split(" ").filter((w) => w.length > 1); }

function levenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const m = a.length, n = b.length;
  if (!m || !n) return Math.max(m, n);
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

function numTokens(s) { return norm(s).match(/\d+/g) || []; }
function tokenScore(qt, et) {
  if (qt === et) return 1;
  // префиксный бонус — только для токенов от 4 букв (иначе «as» матчится с «astrol»)
  if ((et.startsWith(qt) || qt.startsWith(et)) && Math.min(qt.length, et.length) >= 4) return 0.85;
  const d = levenshtein(qt, et);
  const mx = Math.max(qt.length, et.length);
  if (mx >= 5 && d <= 1) return 0.75;
  if (mx >= 7 && d <= 2) return 0.6;
  return 0;
}

function scoreVariants(tokenSets, qNorm, variants) {
  let best = 0;
  const qNums = numTokens(qNorm); // числа в запросе — различитель «Астрол-1» vs «Астрол-2»
  for (const v of variants) {
    const et = tokens(v);
    if (!et.length) continue;
    const vNorm = norm(v);
    const vNums = numTokens(vNorm);
    // число из запроса не подтверждено именем записи (нет или другое) → это, скорее всего,
    // другой объект: кап в зону ручной проверки. Лишние числа в имени записи не штрафуются.
    const numClash = qNums.length && qNums.some((n) => !vNums.includes(n));
    for (const qTokens of tokenSets) {
      if (!qTokens.length) continue;
      let sum = 0;
      for (const qt of qTokens) {
        let b = 0;
        for (const tok of et) b = Math.max(b, tokenScore(qt, tok));
        sum += b;
      }
      let s = sum / qTokens.length;
      if (vNorm === qNorm) s = 1;
      else if (vNorm.includes(qNorm) && qNorm.length > 3) s = Math.max(s, 0.9);
      if (numClash) s = Math.min(s, 0.65);
      best = Math.max(best, s);
    }
    if (best === 1) break;
  }
  return best;
}

function scoreEntity(tokenSets, qNorm, entity) {
  const strong = [entity.name, ...(entity.aliases || []).slice(0, 6)];
  let best = scoreVariants(tokenSets, qNorm, strong);
  // weak-aka OFAC: совпадение возможно, но ограничено 0.6 и помечается в карточке
  const weak = (entity.weak_aliases || []).slice(0, 6);
  const bestWeak = weak.length ? scoreVariants(tokenSets, qNorm, weak) : 0;
  entity._weakm = bestWeak > best && bestWeak >= 0.5;
  if (bestWeak > best) best = Math.min(bestWeak, 0.6);
  const idq = qNorm.replace(/\s+/g, "");
  if (idq.length > 4 && (entity.identifiers || []).some((i) => norm(i).replace(/\s+/g, "").includes(idq)))
    best = Math.max(best, 0.95);
  return best;
}

/* ---------- cross-list xref & identifier completeness ---------- */
let XL = null; // key|year -> Set(sources)
function dobYear(e) { const m = (e.dob || "").match(/(\d{4})/); return m ? m[1] : ""; }
function buildXref() {
  XL = new Map();
  for (const e of ALL) {
    const k = e.key + "|" + dobYear(e);
    if (!XL.has(k)) XL.set(k, new Set());
    XL.get(k).add(e.source);
  }
}
function xlists(e) {
  if (!XL) return 1;
  const s = XL.get(e.key + "|" + dobYear(e));
  return s ? s.size : 1;
}
function idFlags(e) {
  const ids = (e.identifiers || []).join(" ").toLowerCase();
  return {
    dob: !!e.dob,
    doc: /passport|document|national id|id no|identification(?!: imo)|cedula|dpi/.test(ids) && !/vessel registration/.test(ids),
    tax: /fiscal|tax|inn|tin|инн/.test(ids),
    imo: /imo\s*\d/.test(ids),
  };
}
function pluralLists(n) {
  if (LANG === "en") return n === 1 ? "list" : "lists";
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "список";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "списка";
  return "списков";
}

/* ---------- screening ---------- */
const qEl = document.getElementById("q");
const metaEl = document.getElementById("searchMeta");
const resEl = document.getElementById("results");
const detEl = document.getElementById("detail");
let results = [];
let selected = -1;
let searchSeq = 0;
let rFilter = "all"; // фильтр выдачи по уровню совпадения: all/hi/md/lo
// hi = только точные: 100% по имени или 99% (точное совпадение по идентификатору, буст 0.99);
// 85–98% (в т.ч. префиксный бонус) — частичные, уходят в «Проверить»
const rLevel = (s) => { const sc = Math.round(s * 100); return sc >= 99 ? "hi" : sc >= 65 ? "md" : "lo"; };

const advEls = {
  dob: document.getElementById("advDob"),
  country: document.getElementById("advCountry"),
  doc: document.getElementById("advDoc"),
  imo: document.getElementById("advImo"),
};
/* --- даты рождения: нормализация форматов источников и ввода --- */
const MONTHS3 = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
function parseDobQuery(s) {
  s = (s || "").trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);              // ISO: 1966-03-25
  if (m) return { y: +m[1], mo: +m[2], d: +m[3] };
  m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);            // ДД.ММ.ГГГГ (ru) / MM/DD/YYYY (en)
  if (m) {
    const a = +m[1], b = +m[2];
    const [d, mo] = LANG === "en" ? [b, a] : [a, b];
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return { y: +m[3], mo, d };
  }
  m = s.match(/^(\d{4})$/);                                       // только год: 1966
  if (m) return { y: +m[1], mo: 0, d: 0 };
  return null;
}
function dobCandidates(dob) { // все полные даты, встречающиеся в строке dob записи
  const out = [];
  const s = dob || "";
  for (const m of s.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)) out.push({ y: +m[1], mo: +m[2], d: +m[3] });
  for (const m of s.matchAll(/(\d{1,2})[./](\d{1,2})[./](\d{4})/g)) out.push({ y: +m[3], mo: +m[2], d: +m[1] });
  for (const m of s.matchAll(/(\d{1,2})\s+([A-Za-z]{3,})\w*\.?,?\s+(\d{4})/g)) {
    const mo = MONTHS3[m[2].slice(0, 3).toLowerCase()];
    if (mo) out.push({ y: +m[3], mo, d: +m[1] });
  }
  return out;
}
function readAdv() {
  return {
    dob: parseDobQuery(advEls.dob.value),
    country: advEls.country.value,
    doc: norm(advEls.doc.value).replace(/[^a-z0-9\u0400-\u04FF]/g, ""),
    imo: alnum(advEls.imo.value).slice(0, 10), // IMO судна или бортовой/серийный № самолёта (буквы+цифры)
  };
}
function advCount(a) { return (a.dob ? 1 : 0) + (a.country ? 1 : 0) + (a.doc ? 1 : 0) + (a.imo ? 1 : 0); }
function alnum(x) { return norm(x).replace(/[^a-z0-9\u0400-\u04FF]/g, ""); }

async function search(query) {
  const seq = ++searchSeq;
  rFilter = "all";
  const qNorm0 = norm(query);
  const adv = readAdv();
  const hasAdv = advCount(adv) > 0;
  if (qNorm0.length < 2 && !hasAdv) {
    results = []; selected = -1;
    renderResults(); renderDetail();
    metaEl.textContent = "";
    resEl.innerHTML = `<div class="empty"><div>${t("type_q")}</div></div>`;
    return;
  }
  metaEl.textContent = t("searching");
  let pool;
  try {
    pool = await loadAll((f) => { if (seq === searchSeq) metaEl.textContent = `${t("searching")} ${Math.round(f * 100)}%`; });
    ALL = pool; XL = null; buildXref(); fillAdvCountries(); // фильтры дашборда тоже получают данные
    if (seq === searchSeq) renderDashboard();
  } catch {
    metaEl.textContent = "data load error";
    return;
  }
  if (seq !== searchSeq) return;

  const fSrc = document.getElementById("fSource").value;
  const fTyp = document.getElementById("fType").value;
  if (fSrc) pool = pool.filter((e) => e.source === fSrc);
  if (fTyp) pool = pool.filter((e) => e.type === fTyp);

  // --- уточняющие фильтры (жёсткие) ---
  if (adv.country) pool = pool.filter((e) => (e.countries || []).map(fixCountry).includes(adv.country));
  if (adv.imo) pool = pool.filter((e) => (e.identifiers || []).some((i) => alnum(i).includes(adv.imo)));
  if (adv.doc) pool = pool.filter((e) => (e.identifiers || []).some((i) => alnum(i).includes(adv.doc)));
  if (adv.dob) pool = pool.filter((e) => {
    const c = dobCandidates(e.dob);
    if (c.length) return adv.dob.mo
      ? c.some((x) => x.y === adv.dob.y && x.mo === adv.dob.mo && x.d === adv.dob.d)
      : c.some((x) => x.y === adv.dob.y); // введён только год — сверяем год
    const ys = (e.dob || "").match(/\d{4}/g); // в записи только год — сверяем год
    return !ys || ys.includes(String(adv.dob.y));
  });
  const idMatched = new Set();
  if (adv.imo || adv.doc) pool.forEach((e) => idMatched.add(e));

  // --- поиск только по уточняющим полям (без имени) ---
  if (qNorm0.length < 2) {
    results = pool.slice(0, 100).map((e) => [idMatched.has(e) ? 1 : 0.85, e]);
    results.forEach(([, e]) => { e._idm = idMatched.has(e); });
    selected = results.length ? 0 : -1;
    renderResults(); renderDetail();
    metaEl.textContent = `${results.length}${pool.length > 100 ? "+" : ""} ${t("results_n")}`;
    return;
  }

  const qNorm = norm(query);
  const tokenSets = [tokens(qNorm)];
  const latTokens = tokens(translit(qNorm));
  if (latTokens.join(" ") !== tokenSets[0].join(" ")) tokenSets.push(latTokens);

  const idq = qNorm0.replace(/\s+/g, "");
  const prefilter = (e) => {
    if (idq.length > 4 && (e.identifiers || []).some((i) => norm(i).replace(/\s+/g, "").includes(idq)))
      return true;
    const hay = e.key + " " + (e.aliases || []).slice(0, 6).map(norm).join(" ") + " " +
      (e.weak_aliases || []).slice(0, 4).map(norm).join(" ");
    for (const set of tokenSets)
      for (const qt of set)
        if (hay.includes(qt)) return true;
    for (const set of tokenSets)
      for (const qt of set)
        for (const tok of e.key.split(" "))
          if (tok[0] === qt[0] && Math.abs(tok.length - qt.length) <= 2) return true;
    return false;
  };

  const scored = [];
  for (const e of pool) {
    if (!prefilter(e)) continue;
    let s = scoreEntity(tokenSets, qNorm, e);
    e._idm = idMatched.has(e);
    if (e._idm) s = Math.max(s, 0.99); // точное по идентификатору — наверх
    if (s >= 0.5) scored.push([s, e]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  results = scored.slice(0, 100);
  selected = results.length ? 0 : -1;
  renderResults();
  renderDetail();
  metaEl.textContent = `${results.length} ${t("results_n")}`;
}

function renderResults() {
  const rf = document.getElementById("rFilter");
  if (!results.length) {
    rf.hidden = true;
    resEl.classList.remove("filled");
    if (norm(qEl.value).length >= 2)
      resEl.innerHTML = `<div class="empty"><div>${t("no_results")}</div></div>`;
    return;
  }
  // чипы фильтра по уровню совпадения (как в Реестре)
  const cnt = { hi: 0, md: 0, lo: 0 };
  results.forEach(([s]) => cnt[rLevel(s)]++);
  const chip = (k, n) =>
    `<button type="button" class="rchip${k !== "all" ? " " + k : ""}${rFilter === k ? " on" : ""}" data-f="${k}"${!n ? " disabled" : ""}><b>${n}</b>${t("r_f_" + k)}</button>`;
  rf.hidden = false;
  rf.innerHTML = chip("all", results.length) + chip("hi", cnt.hi) + chip("md", cnt.md) + chip("lo", cnt.lo);
  rf.querySelectorAll(".rchip").forEach((c) =>
    c.addEventListener("click", () => { rFilter = c.dataset.f; renderResults(); }));
  const view = results.map((r, i) => [r, i]).filter(([[s]]) => rFilter === "all" || rLevel(s) === rFilter);
  if (!view.length) {
    resEl.classList.remove("filled");
    resEl.innerHTML = `<div class="empty"><div>${t("no_results")}</div></div>`;
    return;
  }
  resEl.classList.add("filled");
  resEl.innerHTML = view.map(([[s, e], i]) => {
    const sc = Math.round(s * 100);
    const cls = rLevel(s);
    const type = t("t_" + e.type) || e.type;
    const sub = [type, (e.countries || []).join(" · "), e.dob].filter(Boolean).join(" · ");
    const xl = xlists(e);
    const f = idFlags(e);
    const L = LANG === "en" ? ["DOB", "DOC", "TAX"] : ["ДР", "ДОК", "ИНН"];
    const idb = e.type === "vessel"
      ? `<span class="idb"><span class="${f.imo ? "y" : ""}">IMO</span><span class="${f.tax ? "y" : ""}">${L[2]}</span></span>`
      : `<span class="idb"><span class="${f.dob ? "y" : ""}">${L[0]}</span><span class="${f.doc ? "y" : ""}">${L[1]}</span><span class="${f.tax ? "y" : ""}">${L[2]}</span></span>`;
    return `<div class="r-row ${i === selected ? "sel" : ""}" data-i="${i}" role="option" tabindex="-1">
      <span class="badge">${e.source}</span>
      <span><div class="nm">${esc(e.name)}</div>
      <div class="sub">${esc(sub)}</div></span>
      <span class="xmeta">${(e.measures || []).includes("non_sdn") ? `<span class="xlists nonsdn">non-SDN</span>` : ""}<span class="xlists${xl >= 3 ? " hot" : ""}"><b>${xl}</b> ${pluralLists(xl)}</span>${idb}</span>
      <span class="score ${cls}">${sc}%</span></div>`;
  }).join("");
  resEl.querySelectorAll(".r-row").forEach((r) =>
    r.addEventListener("click", () => { selected = +r.dataset.i; renderResults(); renderDetail(); }));
}

function extLinks(e) {
  // внешние базы по номеру: IMO для судов, бортовой номер для самолётов
  const ids = (e.identifiers || []).join("\n");
  const out = [];
  if (e.type === "vessel") {
    const m = ids.match(/imo[:\s]*(\d{7})/i);
    if (m) {
      const imo = m[1];
      out.push(["MarineTraffic", `https://www.marinetraffic.com/en/ais/details/ships/imo:${imo}`]);
      out.push(["VesselFinder", `https://www.vesselfinder.com/vessels/details/${imo}`]);
      out.push(["BalticShipping", `https://www.balticshipping.com/vessel/imo/${imo}`]);
    }
  }
  if (e.type === "aircraft") {
    const t = ids.match(/tail number[:\s]*([A-Z0-9][A-Z0-9-]{2,9})/i);
    const nm = (e.name || "").match(/^([A-Z0-9]{1,2}-[A-Z0-9]{2,6})$/);
    const reg = (t ? t[1] : nm ? nm[1] : "").toLowerCase();
    if (reg) {
      out.push(["FlightRadar24", `https://www.flightradar24.com/data/aircraft/${reg}`]);
      out.push(["Planespotters", `https://www.planespotters.net/search?q=${reg}`]);
      out.push(["FlightAware", `https://www.flightaware.com/resources/registration/${reg.toUpperCase()}`]);
    }
  }
  return out;
}
function renderDetail() {
  const searched = norm(qEl.value).length >= 2 || advCount(readAdv()) > 0;
  if ((selected < 0 || !results[selected]) && searched) {
    detEl.innerHTML = `<div class="empty"><div>${t("no_results")}</div></div><div class="warn" style="margin-top:14px">${t("no_results_sub")}</div>`;
    return;
  }
  if (selected < 0 || !results[selected]) {
    detEl.innerHTML = `<div class="empty">${t("select_hint")}</div>`;
    return;
  }
  const [score, e] = results[selected];
  const srcName = (STATS.sources[e.source] || {}).name || e.source;
  const ext = extLinks(e);
  const ms = (e.measures && e.measures.length ? e.measures : ["blocking"]);
  detEl.innerHTML = `
    <h3>${esc(e.name)}</h3>
    <div class="d-sub">${e.id} · ${Math.round(score * 100)}%</div>
    <div class="mchips" style="margin:8px 0 2px">${ms.map((m) =>
      `<span class="mchip ${m === "blocking" ? "block" : "nonsdn"}">${t("m_" + m).replace(/^· /, "")}</span>`).join("")}</div>
    <div class="d-sec"><h4>${t("d_type")}</h4><div class="val">${t("t_" + e.type) || e.type}</div></div>
    <div class="d-sec"><h4>${t("d_source")}</h4><div class="val">${esc(srcName)}</div></div>
    ${e.dob ? `<div class="d-sec"><h4>${t("d_dob")}</h4><div class="mono">${esc(e.dob)}</div></div>` : ""}
    ${e.listed_on ? `<div class="d-sec"><h4>${e.listed_on_kind === "os" ? t("d_listed_os") : t("d_listed")}</h4><div class="mono">${esc(e.listed_on)}</div></div>` : ""}
    ${(e.countries || []).length ? `<div class="d-sec"><h4>${t("d_countries")}</h4><div>${e.countries.map((c) => `<span class="tag ct">${esc(c)}</span>`).join("")}</div></div>` : ""}
    ${(e.programs || []).length ? `<div class="d-sec"><h4>${t("d_programs")}</h4><div>${e.programs.map((p) => `<span class="tag">${esc(p)}</span>`).join("")}</div></div>` : ""}
    ${(e.identifiers || []).length ? `<div class="d-sec"><h4>${t("d_ids")}</h4><div class="mono">${e.identifiers.map(escIds).join("<br>")}</div></div>` : ""}
    ${ext.length ? `<div class="d-sec"><h4>${t("d_extcheck")}</h4><div class="extlinks">${ext.map(([n, u]) => `<a class="extlink" href="${u}" target="_blank" rel="noopener">${n} ↗</a>`).join("")}</div><div class="muted small" style="margin-top:6px">${t("d_extcheck_note")}</div></div>` : ""}
    ${(e.aliases || []).length ? `<div class="d-sec"><h4>${t("d_aliases")}</h4><div class="mono">${e.aliases.slice(0, 12).map(esc).join("<br>")}${e.aliases.length > 12 ? `<br><span class="muted">…+${e.aliases.length - 12}</span>` : ""}</div></div>` : ""}
    ${(e.weak_aliases || []).length ? `<div class="d-sec"><h4>${t("d_weak_aliases")}</h4><div class="mono muted">${e.weak_aliases.slice(0, 8).map(esc).join("<br>")}${e.weak_aliases.length > 8 ? `<br>…+${e.weak_aliases.length - 8}` : ""}</div></div>` : ""}
    ${e._weakm ? `<div class="warn">${t("weak_match")}</div>` : ""}
    ${e.remarks ? `<div class="d-sec"><h4>Remarks</h4><div class="val muted">${esc(e.remarks)}</div></div>` : ""}
    ${e._idm ? `<div class="idmatch">${t("id_match")}</div>` : ""}
    <div class="warn">${t({ person: "d_warn_person", entity: "d_warn_entity", vessel: "d_warn_vessel", aircraft: "d_warn_aircraft" }[e.type] || "d_warn")}</div>`;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
// нормализация написания IMO при показе: источники пишут и «IMO9274800», и «IMO 9906544»
function escIds(s) { return esc(s).replace(/\bIMO\s?(\d{7})\b/gi, "IMO $1"); }

let debounce;
qEl.addEventListener("input", () => {
  document.getElementById("qClear").hidden = !qEl.value;
  qEl.closest(".qbox").classList.toggle("has-text", !!qEl.value);
  clearTimeout(debounce); debounce = setTimeout(() => search(qEl.value), 250);
});
document.getElementById("qClear").addEventListener("click", () => {
  qEl.value = ""; document.getElementById("qClear").hidden = true;
  qEl.closest(".qbox").classList.remove("has-text");
  search(""); qEl.focus();
});
qEl.addEventListener("keydown", (ev) => {
  if (ev.key === "ArrowDown" && results.length) { ev.preventDefault(); selected = Math.min(selected + 1, results.length - 1); renderResults(); renderDetail(); }
  if (ev.key === "ArrowUp" && results.length) { ev.preventDefault(); selected = Math.max(selected - 1, 0); renderResults(); renderDetail(); }
});
document.getElementById("fSource").addEventListener("change", () => search(qEl.value));
document.getElementById("fType").addEventListener("change", () => search(qEl.value));

/* --- advanced search UI --- */
const advPanel = document.getElementById("advPanel");
const advToggle = document.getElementById("advToggle");
function refreshAdvN() {
  const n = advCount(readAdv());
  const el = document.getElementById("advN");
  el.hidden = !n; el.textContent = n;
  advToggle.classList.toggle("active", n > 0);
}
advToggle.addEventListener("click", () => {
  const open = advPanel.hidden;
  advPanel.hidden = !open;
  advToggle.setAttribute("aria-expanded", open);
  if (open && !advEls.country.options.length) fillAdvCountries();
});
function fillAdvCountries() {
  if (!ALL || !ALL.length) return;
  const cnt = {};
  for (const e of ALL) for (const c0 of e.countries || []) {
    const c = fixCountry(c0);
    cnt[c] = (cnt[c] || 0) + 1;
  }
  const opts = Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([c]) => {
    const nm = countryName(c);
    const label = c === "ZZ" ? t("country_unknown") : (nm && nm !== c ? `${nm} (${c})` : c);
    return `<option value="${c}">${esc(label)}</option>`;
  }).join("");
  const cur = advEls.country.value;
  advEls.country.innerHTML = `<option value="">${t("adv_any")}</option>` + opts;
  advEls.country.value = cur;
}
["advDob", "advDoc", "advImo"].forEach((id) =>
  document.getElementById(id).addEventListener("input", () => {
    refreshAdvN();
    clearTimeout(debounce); debounce = setTimeout(() => search(qEl.value), 300);
  }));
advEls.country.addEventListener("change", () => { refreshAdvN(); search(qEl.value); });
document.getElementById("advReset").addEventListener("click", () => {
  advEls.dob.value = ""; advEls.doc.value = ""; advEls.imo.value = ""; advEls.country.value = "";
  advTip.classList.remove("show");
  refreshAdvN(); search(qEl.value); qEl.focus();
});

/* --- тултипы (i) у подписей полей доп. фильтров --- */
const advTip = document.getElementById("advTip");
{
  let advHideTimer = null;
  const placeTip = (btn) => {
    const r = btn.getBoundingClientRect();
    advTip.textContent = t(btn.dataset.tip);
    advTip.style.left = Math.max(8, Math.min(r.left - 150, innerWidth - 336)) + "px";
    advTip.style.top = (r.bottom + 8) + "px";
  };
  const showTip = (btn) => { clearTimeout(advHideTimer); placeTip(btn); advTip.classList.add("show"); };
  const hideTip = () => { advHideTimer = setTimeout(() => advTip.classList.remove("show"), 160); };
  advPanel.querySelectorAll(".adv-info").forEach((btn) => {
    btn.addEventListener("mouseenter", () => showTip(btn));
    btn.addEventListener("mouseleave", hideTip);
    btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); showTip(btn); });
  });
  advTip.addEventListener("mouseenter", () => clearTimeout(advHideTimer));
  advTip.addEventListener("mouseleave", hideTip);
  document.addEventListener("click", () => advTip.classList.remove("show"));
}

/* ---------- changelog ---------- */
let changelogLoaded = false;
let CHANGELOG = []; // распарсенные записи журнала (для CSV-выгрузки)
async function renderChangelog() {
  if (changelogLoaded) return;
  changelogLoaded = true;
  const box = document.getElementById("changelog");
  try {
    const txt = await (await fetch("data/changelog.jsonl")).text();
    const lines = txt.trim().split("\n").filter(Boolean).map(JSON.parse).reverse();
    CHANGELOG = lines;
    if (!lines.length) { box.innerHTML = `<div class="empty">—</div>`; return; }
    box.innerHTML = lines.map((en) => {
      const dt = new Date(en.ts).toLocaleString(LANG === "ru" ? "ru-RU" : "en-GB");
      const body = en.initial
        ? `<div class="cl-src muted">${t("initial_load")}</div>`
        : Object.entries(en.changes).map(([src, c]) => `
            <div class="cl-src"><b>${src}</b>:
              <span class="cnt add">+${c.added_count} ${t("added")}</span> ·
              <span class="cnt rem">−${c.removed_count} ${t("removed")}</span></div>`)
          .join("");
      return `<div class="cl-entry"><div class="cl-date">${dt}</div>${body}</div>`;
    }).join("");
  } catch {
    box.innerHTML = `<div class="empty">—</div>`;
  }
}
document.getElementById("logCsv").addEventListener("click", () => {
  if (!CHANGELOG.length) return;
  const rows = [["timestamp", "source", "action", "id", "name"]];
  for (const en of [...CHANGELOG].reverse()) { // от старых к новым
    for (const [src, c] of Object.entries(en.changes || {})) {
      for (const a of c.added || []) rows.push([en.ts, src, "added", a.id, a.name || ""]);
      for (const r of c.removed || []) rows.push([en.ts, src, "removed", r.id, r.name || ""]);
    }
  }
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "sanctionswatch-changelog.csv" });
  a.click();
  URL.revokeObjectURL(url);
});

/* ---------- sources view ---------- */
async function renderSources() {
  const s = STATS;
  let health = null;
  try { health = await (await fetch("data/health.json")).json(); } catch { /* старая версия данных */ }
  const hs = (health && health.sources) || {};
  const badge = (k) => {
    const h = hs[k];
    if (!h) return "";
    if (h.status === "ok") return `<span class="hbadge ok">${t("hs_ok")}</span>`;
    if (h.status === "stale") return `<span class="hbadge stale" title="${esc(h.error)}">${t("hs_stale")}</span>`;
    return `<span class="hbadge bad" title="${esc(h.error)}">${t("hs_failed")}</span>`;
  };
  const mainRows = SOURCES_ORDER.map((k) => {
    const v = s.sources[k];
    const host = v.url.replace(/^https?:\/\//, "").split("/")[0];
    return `<tr><td class="muted" style="font-family:var(--mono)">${k}</td>
      <td>${esc(v.name)}<br><span class="muted small">${esc(v.via)}</span></td>
      <td class="num">${fmt.format(s.by_source[k] || 0)}</td>
      <td>${badge(k)}</td>
      <td class="muted">${SOURCE_FMT[k]}</td>
      <td><a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(host)} ↗</a></td></tr>`;
  }).join("");
  const auxRows = Object.entries(hs)
    .filter(([k, h]) => !SOURCES_ORDER.includes(k))
    .map(([k, h]) => {
      const host = h.url.replace(/^https?:\/\//, "").split("/")[0];
      return `<tr class="auxrow"><td class="muted" style="font-family:var(--mono)">${k}</td>
        <td>${esc(h.name)}<br><span class="muted small">${esc(h.note || "")}</span></td>
        <td class="num">${h.records ? fmt.format(h.records) : "—"}</td>
        <td>${badge(k)}</td><td></td>
        <td><a href="${esc(h.url)}" target="_blank" rel="noopener">${esc(host)} ↗</a></td></tr>`;
    }).join("");
  document.getElementById("sourcesTable").innerHTML =
    `<tr><th></th><th>${t("col_name")}</th><th class="num">${t("col_count")}</th><th>${t("col_status")}</th><th>${t("col_fmt")}</th><th>${t("col_url")}</th></tr>` +
    mainRows + auxRows +
    (health && health.generated_at ? `<tr class="auxrow"><td></td><td colspan="5" class="muted small">${t("hs_checked")}: ${esc(health.generated_at.replace("T", " ").slice(0, 16))} UTC</td></tr>` : "");
}

/* ---------- batch ---------- */
const bEls = {
  uploadPanel: document.getElementById("bUploadPanel"),
  mapPanel: document.getElementById("bMapPanel"),
  resPanel: document.getElementById("bResPanel"),
  drop: document.getElementById("bDrop"),
  file: document.getElementById("bFile"),
  map: document.getElementById("bMap"),
  preview: document.getElementById("bPreview"),
  fileInfo: document.getElementById("bFileInfo"),
  run: document.getElementById("bRun"),
  back: document.getElementById("bBack"),
  export: document.getElementById("bExport"),
  again: document.getElementById("bAgain"),
  sum: document.getElementById("bSum"),
  resFilter: document.getElementById("bResFilter"),
  resTable: document.getElementById("bResTable"),
  tpl: document.getElementById("bTpl"),
};
let bHeaders = [], bData = [], bResults = null, bFilter = "all", bFileName = "";

// --- чтение файла ---
function parseCsv(text) {
  const first = text.slice(0, 2000).split("\n")[0] || "";
  const delim = [";", ",", "\t"].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  const rows = []; let row = [], cur = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === delim) { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); cur = ""; rows.push(row); row = [];
    } else cur += c;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
async function bReadFile(file) {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  let rows;
  if (ext === "csv") rows = parseCsv(await file.text());
  else {
    if (!window.XLSX) throw new Error("xlsx lib not loaded");
    const wb = XLSX.read(await file.arrayBuffer());
    rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: "" });
  }
  rows = rows.map((r) => r.map((c) => String(c ?? "").trim())).filter((r) => r.some((c) => c !== ""));
  if (rows.length > 10001) rows = rows.slice(0, 10001);
  return rows;
}

// --- автоматическое угадывание колонок ---
function bGuess() {
  const H = bHeaders.map((h) => norm(h));
  const find = (re) => H.findIndex((h) => re.test(h));
  const colText = (i) => bData.slice(0, 30).map((r) => r[i] || "");
  const guess = {
    name: find(/наимен|назван|имя|фио|контрагент|компани|организац|судно|корабль|name|company|entity|vessel|counterparty|organisation|organization/),
    id: find(/\bинн\b|инн\b|огрн|\bimo\b|\binn\b|ogrn|идентификатор|номер\s*док|паспорт|борт|tail|\breg\b|document|tax\s*id|registration/),
    dob: find(/дата\s*рожд|д\.?\s*р\.?|birth|\bdob\b/),
    country: find(/страна|country|гражданств|nationality/),
  };
  if (guess.name < 0) { // колонка с самым длинным «текстовым» содержимым
    let best = -1, bestLen = 0;
    for (let i = 0; i < bHeaders.length; i++) {
      if (Object.values(guess).includes(i)) continue;
      const cells = colText(i).filter(Boolean);
      const avg = cells.reduce((s, c) => s + c.length, 0) / (cells.length || 1);
      const numRatio = cells.filter((c) => /^[\d\s.,-]+$/.test(c)).length / (cells.length || 1);
      if (avg > bestLen && numRatio < 0.5) { bestLen = avg; best = i; }
    }
    guess.name = best;
  }
  return guess;
}

// --- UI сопоставления ---
const B_FIELDS = ["name", "id", "dob", "country"];
function bRenderMap() {
  const guess = bGuess();
  const opts = (sel) => `<option value="-1">${t("b_map_skip")}</option>` +
    bHeaders.map((h, i) => `<option value="${i}"${i === sel ? " selected" : ""}>${esc(h || "—")}</option>`).join("");
  bEls.map.innerHTML = B_FIELDS.map((f) =>
    `<label><span>${t("b_map_" + f)}</span><select data-f="${f}">${opts(guess[f])}</select></label>`).join("");
  const ncol = bHeaders.length;
  const head = bHeaders.map((h) => `<th>${esc(h || "—")}</th>`).join("");
  const body = bData.slice(0, 5).map((r) =>
    `<tr>${Array.from({ length: ncol }, (_, i) => `<td>${esc(r[i] || "")}</td>`).join("")}</tr>`).join("");
  bEls.preview.innerHTML = `<tr>${head}</tr>${body}`;
  bEls.map.querySelectorAll("select").forEach((s) => s.addEventListener("change", refreshBRun));
  refreshBRun();
}
function bMapping() {
  const m = {};
  bEls.map.querySelectorAll("select").forEach((s) => (m[s.dataset.f] = +s.value));
  return m;
}
function refreshBRun() {
  const m = bEls.map.querySelectorAll("select").length ? bMapping() : { name: -1 };
  bEls.run.disabled = !ALL || m.name < 0;
  bEls.run.textContent = ALL ? t("b_run") : t("b_wait");
  bEls.run.title = m.name < 0 ? t("b_need_name") : "";
}

// --- страна: свободный текст → код записи ---
let _bCMap = null;
function bCountryCode(s) {
  const q = norm(s || "");
  if (!q || !ALL) return null;
  if (!_bCMap) {
    _bCMap = {};
    const codes = new Set();
    for (const e of ALL) for (const c of e.countries || []) if (c && c.length === 2) codes.add(c);
    try {
      for (const lang of ["ru", "en"]) {
        const dn = new Intl.DisplayNames([lang], { type: "region" });
        for (const c of codes) { const nm = dn.of(c); if (nm) _bCMap[norm(nm)] = c; }
      }
    } catch { /* нет Intl — только коды */ }
    for (const c of codes) _bCMap[norm(c)] = c;
  }
  return _bCMap[q] || null;
}

// --- матчинг одной строки ---
function bMatchOne(nm, idq, dob, cc) {
  const pool = ALL;
  // точное совпадение по идентификатору
  if (idq && idq.length >= 5) {
    for (const e of pool) {
      if (cc && !(e.countries || []).map(fixCountry).includes(cc)) continue;
      if ((e.identifiers || []).some((i) => { const ii = alnum(i); return ii.length >= 5 && ii.includes(idq); }))
        return { e, score: 1, idm: true };
    }
  }
  const qNorm = norm(nm);
  if (qNorm.length < 2) return null;
  const tokenSets = [tokens(qNorm)];
  const lat = tokens(translit(qNorm));
  if (lat.join(" ") !== tokenSets[0].join(" ")) tokenSets.push(lat);
  let best = null;
  for (const e of pool) {
    if (cc && !(e.countries || []).map(fixCountry).includes(cc)) continue;
    if (dob && e.dob) {
      const cands = dobCandidates(e.dob);
      const ok = dob.mo
        ? cands.some((c) => c.y === dob.y && c.mo === dob.mo && c.d === dob.d)
        : cands.some((c) => c.y === dob.y);
      if (cands.length && !ok) continue;
    }
    const hay = e.key + " " + (e.aliases || []).slice(0, 6).map(norm).join(" ") + " " +
      (e.weak_aliases || []).slice(0, 4).map(norm).join(" ");
    let hit = false;
    for (const set of tokenSets) { if (hit) break; for (const qt of set) if (hay.includes(qt)) { hit = true; break; } }
    if (!hit) continue;
    let s = scoreEntity(tokenSets, qNorm, e);
    if (!best || s > best.score) best = { e, score: s, idm: false };
  }
  return best;
}

// --- запуск ---
async function bRunBatch() {
  const m = bMapping();
  if (m.name < 0 || !ALL) return;
  bEls.run.disabled = true;
  const out = [];
  const n = bData.length;
  for (let i = 0; i < n; i++) {
    const r = bData[i];
    const nm = (r[m.name] || "").trim();
    const idq = m.id >= 0 ? alnum(r[m.id] || "").slice(0, 12) : "";
    const dob = m.dob >= 0 ? parseDobQuery(r[m.dob] || "") : null;
    const cc = m.country >= 0 ? bCountryCode(r[m.country]) : null;
    const res = nm ? bMatchOne(nm, idq, dob, cc) : null;
    const score = res ? res.score : 0;
    out.push({
      row: r, e: res ? res.e : null, score, idm: !!(res && res.idm),
      status: score >= 0.85 ? "match" : score >= 0.6 ? "review" : "clean",
    });
    if (i % 100 === 0) {
      bEls.run.textContent = `${t("b_running")} ${Math.round((i / n) * 100)}%`;
      await new Promise((r2) => setTimeout(r2, 0));
    }
  }
  bResults = out; bFilter = "all";
  bEls.mapPanel.hidden = true;
  bEls.resPanel.hidden = false;
  bRender();
  bEls.run.textContent = t("b_run");
  bEls.run.disabled = false;
}

// --- вывод результатов ---
function bRender() {
  if (!bResults) return;
  const cnt = { match: 0, review: 0, clean: 0 };
  bResults.forEach((r) => cnt[r.status]++);
  const stat = (k) =>
    `<span class="bstat ${k} ${bFilter === k ? "on" : ""}" data-f="${k}"><b>${cnt[k]}</b>${t("b_st_" + k)}</span>`;
  bEls.sum.innerHTML =
    `<span class="bstat ${bFilter === "all" ? "on" : ""}" data-f="all"><b>${bResults.length}</b>${t("b_f_all")}</span>` +
    stat("match") + stat("review") + stat("clean");
  bEls.sum.querySelectorAll(".bstat").forEach((s) =>
    s.addEventListener("click", () => { bFilter = s.dataset.f; bRender(); }));
  const rows = bResults.filter((r) => bFilter === "all" || r.status === bFilter);
  const shown = rows.slice(0, 300);
  bEls.resTable.innerHTML =
    `<tr><th>#</th><th>${t("b_th_row")}</th><th>${t("b_th_status")}</th><th class="num">${t("b_th_score")}</th>` +
    `<th>${t("b_th_match")}</th><th>${t("b_th_source")}</th><th>${t("b_th_type")}</th>` +
    `<th>${t("b_th_date")}</th><th>${t("b_th_programs")}</th><th>${t("b_th_measures")}</th></tr>` +
    shown.map((r) => {
      const i = bResults.indexOf(r);
      const cell = esc(r.row.filter(Boolean).slice(0, 3).join(" · "));
      const matchCell = r.e ? esc(r.e.name) + (r.idm ? ` <span class="muted small">(${t("b_idm")})</span>` : "") : `<span class="muted">${t("b_match_none")}</span>`;
      const ms = r.e ? (r.e.measures && r.e.measures.length ? r.e.measures : ["blocking"]) : [];
      return `<tr><td class="muted">${i + 2}</td><td>${cell}</td>` +
        `<td><span class="bst ${r.status}">${t("b_st_" + r.status)}</span></td>` +
        `<td class="num">${r.score ? Math.round(r.score * 100) + "%" : "—"}</td>` +
        `<td>${matchCell}</td><td>${r.e ? esc(r.e.source) : ""}</td><td>${r.e ? esc(t("t_" + r.e.type) || r.e.type) : ""}</td>` +
        `<td class="mono">${r.e && r.e.listed_on ? esc(r.e.listed_on) : "—"}</td>` +
        `<td>${(() => { const pr = r.e ? (r.e.programs || []) : []; if (!pr.length) return "—";
          const full = esc(pr.join(", "));
          const short = pr.slice(0, 2).map((p) => (p.length > 60 ? p.slice(0, 60) + "…" : p));
          return `<span title="${full}">${esc(short.join(", "))}${pr.length > 2 ? ` <span class="muted">+${pr.length - 2}</span>` : ""}</span>`; })()}</td>` +
        `<td>${ms.map((m) => `<span class="mchip ${m === "blocking" ? "block" : "nonsdn"}">${t("m_" + m).replace(/^· /, "")}</span>`).join("")}</td></tr>`;
    }).join("") +
    (rows.length > 300 ? `<tr><td colspan="10" class="muted">${t("b_shown")} ${rows.length} ${t("b_rows")}</td></tr>` : "");
  bEls.fileInfo.textContent = `${bFileName} · ${bResults.length} ${t("b_rows")}`;
}

// --- экспорт ---
function bExportXlsx() {
  if (!bResults || !window.XLSX) return;
  const head = [...bHeaders, t("b_th_status"), t("b_th_score"), t("b_th_match"), t("b_th_source"), t("b_th_type"),
    t("b_th_date"), t("b_th_programs"), t("b_th_measures"), "ID"];
  const aoa = [head];
  bResults.filter((r) => bFilter === "all" || r.status === bFilter).forEach((r) => {
    const ms = r.e ? (r.e.measures && r.e.measures.length ? r.e.measures : ["blocking"]) : [];
    aoa.push([...r.row, t("b_st_" + r.status), r.score ? Math.round(r.score * 100) : "",
      r.e ? r.e.name : "", r.e ? r.e.source : "", r.e ? (t("t_" + r.e.type) || r.e.type) : "",
      r.e && r.e.listed_on ? r.e.listed_on : "", r.e ? (r.e.programs || []).join(", ") : "",
      ms.map((m) => t("m_" + m).replace(/^· /, "")).join(", "), r.e ? r.e.id : ""]);
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "screening");
  XLSX.writeFile(wb, "sanctionswatch-batch.xlsx");
}

// --- шаблон ---
function bDownloadTpl() {
  const aoa = [
    ["name", "id", "dob", "country"],
    [LANG === "ru" ? 'ООО "Пример"' : "Example LLC", "7712345678", "", LANG === "ru" ? "Россия" : "Russia"],
    ["NORD WIND", "IMO 9253325", "", ""],
    [LANG === "ru" ? "Иванов Иван Иванович" : "Ivanov Ivan", "", LANG === "ru" ? "25.03.1966" : "03/25/1966", ""],
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "template");
  XLSX.writeFile(wb, "sanctionswatch-template.xlsx");
}

// --- события ---
async function bHandleFile(file) {
  try {
    const rows = await bReadFile(file);
    if (rows.length < 2) throw new Error("empty");
    bHeaders = rows[0]; bData = rows.slice(1); bFileName = file.name; bResults = null;
    bEls.uploadPanel.hidden = true; bEls.resPanel.hidden = true; bEls.mapPanel.hidden = false;
    bEls.fileInfo.textContent = `${file.name} · ${bData.length} ${t("b_rows")}`;
    bRenderMap();
  } catch {
    alert(t("b_err"));
  }
}
bEls.drop.addEventListener("click", () => bEls.file.click());
bEls.drop.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); bEls.file.click(); } });
bEls.file.addEventListener("change", () => { if (bEls.file.files[0]) bHandleFile(bEls.file.files[0]); });
["dragover", "dragleave", "drop"].forEach((ev) =>
  bEls.drop.addEventListener(ev, (e) => {
    e.preventDefault();
    bEls.drop.classList.toggle("over", ev === "dragover");
    if (ev === "drop" && e.dataTransfer.files[0]) bHandleFile(e.dataTransfer.files[0]);
  }));
bEls.run.addEventListener("click", bRunBatch);
bEls.back.addEventListener("click", () => { bEls.mapPanel.hidden = true; bEls.uploadPanel.hidden = false; });
bEls.again.addEventListener("click", () => {
  bResults = null; bEls.file.value = "";
  bEls.resPanel.hidden = true; bEls.mapPanel.hidden = true; bEls.uploadPanel.hidden = false;
});
bEls.export.addEventListener("click", bExportXlsx);
bEls.tpl.addEventListener("click", bDownloadTpl);

/* ---------- boot ---------- */
async function boot() {
  applyTheme();
  applyI18n();
  await loadStats();
  fillScreenSelects();
  renderDashboard();
  renderSources();
  renderDetail();
  route();
  resEl.innerHTML = `<div class="empty"><div>${t("type_q")}</div></div>`;

  // фоном подтягиваем полный срез — после этого включаются сквозные фильтры
  loadAll((f) => {
    if (!ALL) {
      const box = document.getElementById("chips");
      box.innerHTML = `<span class="loadnote">${t("filters_loading")} ${Math.round(f * 100)}%</span>`;
    }
  }).then((pool) => {
    ALL = pool; XL = null; buildXref(); fillAdvCountries(); refreshBRun();
    renderDashboard();
  }).catch(() => { /* фильтры останутся выключенными, дашборд работает по снапшоту */ });
}
document.getElementById("langToggle").addEventListener("click", () => {
  LANG = LANG === "ru" ? "en" : "ru";
  localStorage.setItem("sw_lang", LANG);
  applyI18n(); fillScreenSelects(); fillAdvCountries(); renderDashboard(); renderSources(); renderResults(); renderDetail();
  if (bResults) bRender();
  changelogLoaded = false; if (document.getElementById("view-changelog").classList.contains("active")) renderChangelog();
});
document.getElementById("themeToggle").addEventListener("click", () => {
  THEME = THEME === "light" ? "dark" : "light";
  localStorage.setItem("sw_theme", THEME);
  applyTheme();
});
boot();
