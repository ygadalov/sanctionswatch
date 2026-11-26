/* SanctionsWatch — фронтенд. Все данные статические, поиск локальный. */
"use strict";

/* ================= i18n ================= */
const I18N = {
  ru: {
    nav_dash: "Дашборд", nav_screen: "Скрининг", nav_batch: "Реестр", nav_log: "История изменений", nav_sources: "Источники",
    updated: "Данные на", loading: "Загружаем базу санкционных списков…",
    map_title: "География списков", map_hint: "Число записей по стране гражданства / регистрации / юрисдикции. Одна запись может относиться к нескольким странам. Нажмите на страну, чтобы перейти к её записям в скрининге.",
    by_type: "По типу объектов", by_country: "Топ-15 стран", by_program: "Топ-12 программ",
    measure_title: "Виды ограничений", measure_hint: "Тип меры извлекается из текстового обоснования (notes / statement of reasons) официального источника. Если в источнике мера не описана текстом, запись не попадает в эту статистику — поэтому сумма меньше общего числа записей.",
    years_title: "Динамика включений по годам", years_hint: "По дате первого включения в список (listingDate). Записи без даты в источнике не учитываются.",
    t_person: "Физлица", t_org: "Организации", t_vessel: "Суда", t_aircraft: "Воздушные суда", t_crypto: "Криптокошельки", total_records: "Всего записей", sources_n: "Источников", countries_n: "Стран",
    q_ph: "Название, имя, псевдоним, ИНН, рег. номер, программа…", refine: "Уточнить поиск",
    all_sources: "Все источники", all_types: "Все типы",
    adv_country: "Страна", adv_dob: "Дата рождения", adv_doc: "Номер документа", adv_imo: "IMO / рег. номер", adv_any: "Любая",
    adv_dob_ph: "ДД.ММ.ГГГГ", adv_reset: "Сбросить уточнения",
    adv_tip_country: "Фильтр по коду страны из записи (гражданство, регистрация, юрисдикция). Например: RU, IR, KP.",
    adv_tip_dob: "Поддерживаются форматы ДД.ММ.ГГГГ, ММ.ГГГГ и ГГГГ. Частичная дата сработает как префикс: «1975» найдёт всех рождённых в 1975 году.",
    adv_tip_doc: "Поиск по всем идентификаторам записи: паспорт, ИНН, ОГРН, налоговый номер, LEI, SWIFT/BIC и др. Работает и по части номера.",
    adv_tip_imo: "Поиск по номеру IMO судна и регистрационным номерам. Работает и по части номера.",
    found: "Найдено", of: "из", records: "записей", showing: "показаны первые", nothing: "Ничего не найдено", try_other: "Измените запрос или сбросьте уточнения.",
    enter_query: "Введите запрос для поиска", enter_hint: "Или нажмите на страну на карте дашборда.",
    sel_hint: "Выберите запись слева, чтобы увидеть детали",
    type: "Тип", country: "Страна", dob: "Дата рождения", pob: "Место рождения", gender: "Пол", position: "Должность",
    aliases: "Псевдонимы и другие имена", ids: "Идентификаторы", addresses: "Адреса", contacts: "Контакты и ссылки",
    programs: "Программы", measures: "Меры", listed: "Дата включения", notes: "Обоснование / примечание источника",
    open_src: "Открыть в OpenSanctions", topics: "Тематические метки",
    m_freeze: "Заморозка активов", m_travel: "Запрет на въезд", m_arms: "Оружейное эмбарго", m_secondary: "Вторичные санкции",
    b_title: "Реестр — пакетная проверка", b_hint: "Загрузите Excel (.xlsx, .xls) или CSV со списком контрагентов. Система сопоставит каждую строку с базой и покажет статус.",
    b_drop: "Перетащите файл сюда или нажмите для выбора", b_drop_sub: "XLSX, XLS или CSV · обработка локально в вашем браузере",
    b_tpl: "Скачать шаблон", b_privacy: "Файл не отправляется на сервер: чтение и сопоставление выполняются JavaScript в вашем браузере.",
    b_map_title: "Сопоставление колонок", b_run: "Запустить проверку", b_back: "Назад",
    b_col_name: "Колонка с именем / названием", b_col_country: "Страна (необязательно)", b_col_dob: "Дата рождения (необязательно)", b_col_id: "Идентификатор / ИНН / IMO (необязательно)", b_skip: "— не использовать —",
    b_res_title: "Результаты проверки", b_export: "Выгрузить XLSX", b_export_csv: "Выгрузить CSV", b_again: "Новая проверка",
    b_all: "Все", b_match: "Совпадения", b_review: "Требуют проверки", b_clean: "Не найдено",
    st_match: "Совпадение", st_review: "Проверить", st_clean: "Не найдено",
    r_name: "Исходное имя", r_matched: "Совпавшая запись", r_source: "Источник", r_score: "Сходство", r_status: "Статус", r_input: "Исходная строка",
    b_details_title: "Все найденные записи", b_detail_note: "Дата, мера и программа сохранены отдельно для каждого источника.", b_record: "Запись", r_matches_n: "Совпадений", b_open_title: "Нажмите на строку, чтобы раскрыть все найденные записи",
    b_done: "Проверка завершена", b_exported: "Файл выгружен", b_badfile: "Не удалось прочитать файл",
    log_title: "История изменений", log_hint: "Журнал ведётся автоматически при каждом обновлении данных: новые записи, исключения и изменения реквизитов.",
    log_csv: "Выгрузить журнал (CSV)", log_empty: "Изменений пока не зафиксировано. Журнал начнёт наполняться со следующего обновления данных.",
    log_added: "Добавлено", log_removed: "Исключено", log_modified: "Изменено", log_baseline: "Базовая сборка",
    src_title: "Официальные источники", src_note: "Все списки — публичные официальные данные, агрегированные проектом OpenSanctions. Данные обновляются автоматически три раза в сутки (00:30 / 02:30 / 04:30 UTC). Проект не является официальным продуктом перечисленных ведомств; для юридически значимых решений сверяйтесь с первоисточником.",
    src_list: "Список", src_org: "Ведомство", src_country: "Юрисдикция", src_count: "Записей", src_link: "Первоисточник",
    foot_disclaimer: "Агрегатор публичных санкционных списков. Не является юридической консультацией.",
    load_fail: "Не удалось загрузить данные. Обновите страницу.",
    copied: "Скопировано", copy: "Копировать имя",
    filter_country: "Страна", reset: "Сбросить",
    match_score_hint: "Токенизированное сходство имён с учётом псевдонимов. 100 — точное совпадение всех токенов.",
  },
  en: {
    nav_dash: "Dashboard", nav_screen: "Screening", nav_batch: "Batch", nav_log: "Changelog", nav_sources: "Sources",
    updated: "Data as of", loading: "Loading sanctions database…",
    map_title: "List geography", map_hint: "Number of records by country of nationality / registration / jurisdiction. A record may relate to several countries. Click a country to screen its records.",
    by_type: "By entity type", by_country: "Top 15 countries", by_program: "Top 12 programs",
    measure_title: "Measure types", measure_hint: "Measure type is extracted from the official source's free-text reason (notes / statement of reasons). Records without such text are not counted here, so the total is lower than the record count.",
    years_title: "Listings by year", years_hint: "By first listing date (listingDate). Records with no date in the source are not counted.",
    t_person: "Individuals", t_org: "Entities", t_vessel: "Vessels", t_aircraft: "Aircraft", t_crypto: "Crypto wallets", total_records: "Total records", sources_n: "Sources", countries_n: "Countries",
    q_ph: "Name, alias, tax ID, registration no., program…", refine: "Refine search",
    all_sources: "All sources", all_types: "All types",
    adv_country: "Country", adv_dob: "Date of birth", adv_doc: "Document number", adv_imo: "IMO / reg. number", adv_any: "Any",
    adv_dob_ph: "DD.MM.YYYY", adv_reset: "Reset filters",
    adv_tip_country: "Filter by the country code in the record (nationality, registration, jurisdiction). E.g. RU, IR, KP.",
    adv_tip_dob: "Formats: DD.MM.YYYY, MM.YYYY or YYYY. Partial dates work as a prefix: “1975” finds everyone born in 1975.",
    adv_tip_doc: "Searches every identifier in the record: passport, tax ID, registration number, LEI, SWIFT/BIC etc. Partial numbers work.",
    adv_tip_imo: "Search by vessel IMO number and registration numbers. Partial numbers work.",
    found: "Found", of: "of", records: "records", showing: "showing first", nothing: "No matches", try_other: "Try a different query or reset the filters.",
    enter_query: "Type a query to search", enter_hint: "Or click a country on the dashboard map.",
    sel_hint: "Select a record on the left to see details",
    type: "Type", country: "Country", dob: "Date of birth", pob: "Place of birth", gender: "Gender", position: "Position",
    aliases: "Aliases and other names", ids: "Identifiers", addresses: "Addresses", contacts: "Contacts & links",
    programs: "Programs", measures: "Measures", listed: "Listing date", notes: "Source reason / notes",
    open_src: "Open in OpenSanctions", topics: "Topic tags",
    m_freeze: "Asset freeze", m_travel: "Travel ban", m_arms: "Arms embargo", m_secondary: "Secondary sanctions",
    b_title: "Batch screening", b_hint: "Upload an Excel (.xlsx, .xls) or CSV file with your counterparties. Each row is matched against the database and given a status.",
    b_drop: "Drop a file here or click to browse", b_drop_sub: "XLSX, XLS or CSV · processed locally in your browser",
    b_tpl: "Download template", b_privacy: "Your file is never uploaded: parsing and matching run in JavaScript in your browser.",
    b_map_title: "Column mapping", b_run: "Run screening", b_back: "Back",
    b_col_name: "Name column", b_col_country: "Country (optional)", b_col_dob: "Date of birth (optional)", b_col_id: "Identifier / tax ID / IMO (optional)", b_skip: "— skip —",
    b_res_title: "Screening results", b_export: "Export XLSX", b_export_csv: "Export CSV", b_again: "New screening",
    b_all: "All", b_match: "Matches", b_review: "Needs review", b_clean: "Not found",
    st_match: "Match", st_review: "Review", st_clean: "Not found",
    r_name: "Input name", r_matched: "Matched record", r_source: "Source", r_score: "Similarity", r_status: "Status", r_input: "Input row",
    b_details_title: "All matched records", b_detail_note: "Date, measure and programme are preserved separately for each source.", b_record: "Record", r_matches_n: "Matches", b_open_title: "Click a row to expand all matched records",
    b_done: "Screening complete", b_exported: "File exported", b_badfile: "Could not read the file",
    log_title: "Changelog", log_hint: "The log is maintained automatically on every data refresh: new records, removals and attribute changes.",
    log_csv: "Export log (CSV)", log_empty: "No changes recorded yet. The log will start filling on the next data refresh.",
    log_added: "Added", log_removed: "Removed", log_modified: "Modified", log_baseline: "Baseline build",
    src_title: "Official sources", src_note: "All lists are public official data aggregated by the OpenSanctions project. Data refreshes automatically three times a day (00:30 / 02:30 / 04:30 UTC). This project is not an official product of the listed authorities; verify against the primary source for legally binding decisions.",
    src_list: "List", src_org: "Authority", src_country: "Jurisdiction", src_count: "Records", src_link: "Primary source",
    foot_disclaimer: "Aggregator of public sanctions lists. Not legal advice.",
    load_fail: "Failed to load data. Please refresh the page.",
    copied: "Copied", copy: "Copy name",
    filter_country: "Country", reset: "Reset",
    match_score_hint: "Token-based name similarity across aliases. 100 means an exact token match.",
  }
};
let LANG = localStorage.getItem("sw_lang") || "ru";
const t = (k) => (I18N[LANG] && I18N[LANG][k]) || I18N.ru[k] || k;

/* ================= helpers ================= */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => new Intl.NumberFormat(LANG === "ru" ? "ru-RU" : "en-US").format(n ?? 0);
const debounce = (fn, ms) => { let h; return (...a) => { clearTimeout(h); h = setTimeout(() => fn(...a), ms); }; };
function toast(msg) { const el = $("toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(el._h); el._h = setTimeout(() => el.classList.remove("on"), 2600); }
function norm(s) {
  if (!s) return "";
  s = String(s).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ё/g, "е");
  return s.replace(/[^a-zа-я0-9]+/gi, " ").replace(/\s+/g, " ").trim();
}
const TYPE_LABEL = (ty) => t("t_" + (ty === "org" ? "org" : ty)) || ty;
const M_LABEL = { freeze: "m_freeze", travel: "m_travel", arms: "m_arms", secondary: "m_secondary" };

/* ================= data ================= */
let IDX = null, ALL = [], NAME_IDX = new Map(), READY = false;
async function loadData() {
  const [idx, all] = await Promise.all([
    fetch("data/entities/index.json").then((r) => r.json()),
    fetch("data/entities/all.json").then((r) => r.json()),
  ]);
  IDX = idx; ALL = all;
  NAME_IDX = new Map();
  ALL.forEach((e, i) => {
    const names = [e.name, ...(e.aliases || [])];
    const key = norm(e.name).slice(0, 2);
    if (!NAME_IDX.has(key)) NAME_IDX.set(key, []);
    NAME_IDX.get(key).push(i);
    e._i = i;
  });
  READY = true;
}

/* ================= theme / lang / router ================= */
function applyTheme() {
  const th = localStorage.getItem("sw_theme") || "light";
  document.documentElement.dataset.theme = th;
  $("themeToggle").innerHTML = th === "dark"
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
}
function applyI18n() {
  document.documentElement.lang = LANG;
  $("langToggle").textContent = LANG === "ru" ? "EN" : "RU";
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  if (IDX) $("updated").textContent = `${t("updated")} ${IDX.date}`;
}
function route() {
  const h = location.hash.replace(/^#\/?/, "") || "dashboard";
  const [name, arg] = h.split("/");
  const r = ["dashboard", "screening", "batch", "changelog", "sources"].includes(name) ? name : "dashboard";
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("on", v.id === "view-" + r));
  document.querySelectorAll(".nav a").forEach((a) => a.classList.toggle("on", a.dataset.route === r));
  if (r === "dashboard") renderDashboard();
  if (r === "screening" && arg) { $("advCountry").value = decodeURIComponent(arg); runSearch(); }
  if (r === "changelog") renderChangelog();
  if (r === "sources") renderSources();
}

/* ================= dashboard ================= */
const CC = { // ISO2 -> ISO numeric for world-atlas
  AF:"004",AL:"008",DZ:"012",AD:"020",AO:"024",AG:"028",AR:"032",AM:"051",AU:"036",AT:"040",AZ:"031",BS:"044",BH:"048",BD:"050",BB:"052",BY:"112",BE:"056",BZ:"084",BJ:"204",BT:"064",BO:"068",BA:"070",BW:"072",BR:"076",BN:"096",BG:"100",BF:"854",BI:"108",KH:"116",CM:"120",CA:"124",CV:"132",CF:"140",TD:"148",CL:"152",CN:"156",CO:"170",KM:"174",CG:"178",CD:"180",CR:"188",CI:"384",HR:"191",CU:"192",CY:"196",CZ:"203",DK:"208",DJ:"262",DM:"212",DO:"214",EC:"218",EG:"818",SV:"222",GQ:"226",ER:"232",EE:"233",ET:"231",FJ:"242",FI:"246",FR:"250",GA:"266",GM:"270",GE:"268",DE:"276",GH:"288",GR:"300",GD:"308",GT:"320",GN:"324",GW:"624",GY:"328",HT:"332",HN:"340",HU:"348",IS:"352",IN:"356",ID:"360",IR:"364",IQ:"368",IE:"372",IL:"376",IT:"380",JM:"388",JP:"392",JO:"400",KZ:"398",KE:"404",KI:"296",KP:"408",KR:"410",KW:"414",KG:"417",LA:"418",LV:"428",LB:"422",LS:"426",LR:"430",LY:"434",LI:"438",LT:"440",LU:"442",MK:"807",MG:"450",MW:"454",MY:"458",MV:"462",ML:"466",MT:"470",MH:"584",MR:"478",MU:"480",MX:"484",FM:"583",MD:"498",MC:"492",MN:"496",ME:"499",MA:"504",MZ:"508",MM:"104",NA:"516",NR:"520",NP:"524",NL:"528",NZ:"554",NI:"558",NE:"562",NG:"566",NO:"578",OM:"512",PK:"586",PW:"585",PA:"591",PG:"598",PY:"600",PE:"604",PH:"608",PL:"616",PT:"620",QA:"634",RO:"642",RU:"643",RW:"646",KN:"659",LC:"662",VC:"670",WS:"882",SM:"674",ST:"678",SA:"682",SN:"686",RS:"688",SC:"690",SL:"694",SG:"702",SK:"703",SI:"705",SB:"090",SO:"706",ZA:"710",SS:"728",ES:"724",LK:"144",SD:"729",SR:"740",SZ:"748",SE:"752",CH:"756",SY:"760",TW:"158",TJ:"762",TZ:"834",TH:"764",TL:"626",TG:"768",TO:"776",TT:"780",TN:"788",TR:"792",TM:"795",TV:"798",UG:"800",UA:"804",AE:"784",GB:"826",US:"840",UY:"858",UZ:"860",VU:"548",VA:"336",VE:"862",VN:"704",YE:"887",ZM:"894",ZW:"716",XK:"383",PS:"275"
};
let MAP_TOPO = null;
async function renderDashboard() {
  if (!READY) return;
  $("chips").innerHTML = IDX.sources.map((s) => `<span class="chip src">${esc(s.code)} · ${esc(s.name)} <b>${fmt(s.count)}</b></span>`).join("");
  $("statrow").innerHTML = `
    <div class="stat"><div class="v">${fmt(IDX.total)}</div><div class="l">${t("total_records")}</div></div>
    ${["person", "org", "vessel", "aircraft"].map((ty) => `<div class="stat"><div class="v">${fmt(IDX.by_type[ty] || 0)}</div><div class="l">${TYPE_LABEL(ty)}</div></div>`).join("")}
    <div class="stat"><div class="v">${fmt(IDX.countries.length)}</div><div class="l">${t("countries_n")}</div></div>`;
  const bars = (obj, el, keys) => {
    const entries = (keys ? keys.map((k) => [k, obj[k] || 0]) : Object.entries(obj).slice(0, 15)).filter(([, v]) => v > 0);
    const max = Math.max(1, ...entries.map(([, v]) => v));
    $(el).innerHTML = entries.length ? entries.map(([k, v]) => {
      const label = M_LABEL[k] ? t(M_LABEL[k]) : (k.length === 2 ? k : k);
      return `<div class="bar-row"><span class="n" title="${esc(label)}">${esc(label)}</span><span class="t"><span class="f" style="width:${(v / max) * 100}%"></span></span><span class="c">${fmt(v)}</span></div>`;
    }).join("") : `<div class="muted small">—</div>`;
  };
  bars(IDX.by_type, "typeChart", ["person", "org", "vessel", "aircraft", "crypto"]);
  bars(IDX.by_country, "countryChart");
  bars(IDX.by_program, "programChart");
  bars(IDX.by_measure, "measureChart", ["freeze", "travel", "arms", "secondary"]);
  const years = Object.entries(IDX.by_year);
  const ymax = Math.max(1, ...years.map(([, v]) => v));
  $("yearChart").innerHTML = years.map(([y, v]) => `<div class="ycol"><span class="v">${v >= 1000 ? (v / 1000).toFixed(1).replace(".0", "") + "k" : v}</span><span class="b" style="height:${Math.max(2, (v / ymax) * 100)}%" title="${y}: ${fmt(v)}"></span><span class="y">${y}</span></div>`).join("");
  if (!MAP_TOPO) {
    try { MAP_TOPO = await (await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")).json(); }
    catch (e) { $("worldmap").innerHTML = `<text x="20" y="30" fill="currentColor">Map unavailable offline</text>`; return; }
  }
  drawMap();
}
function drawMap() {
  const svg = $("worldmap");
  const countries = window.topojson.feature(MAP_TOPO, MAP_TOPO.objects.countries).features;
  const proj = window.d3.geoNaturalEarth1().fitSize([1000, 470], { type: "Sphere" });
  const path = window.d3.geoPath(proj);
  const counts = {};
  Object.entries(IDX.by_country).forEach(([cc, n]) => { const num = CC[cc]; if (num) counts[num] = (counts[num] || 0) + n; });
  const max = Math.max(1, ...Object.values(counts));
  const scale = window.d3.scaleSequentialLog((x) => window.d3.interpolateRgb("#DBEAFE", "#0F2E73")(x)).domain([1, max]);
  $("mapMax").textContent = fmt(max);
  svg.innerHTML = "";
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  countries.forEach((f) => {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", path(f));
    p.setAttribute("class", "country");
    const id = String(f.id).padStart(3, "0");
    const n = counts[id] || 0;
    if (n) { p.setAttribute("fill", scale(n)); p.classList.add("hot"); }
    const name = f.properties.name;
    p.addEventListener("mousemove", (ev) => {
      const tip = $("mapTip"), box = svg.getBoundingClientRect();
      tip.style.opacity = 1;
      tip.textContent = `${name}${n ? " · " + fmt(n) : ""}`;
      tip.style.left = Math.min(ev.clientX - box.left + 12, box.width - 150) + "px";
      tip.style.top = ev.clientY - box.top - 30 + "px";
    });
    p.addEventListener("mouseleave", () => { $("mapTip").style.opacity = 0; });
    if (n) {
      const iso2 = Object.keys(CC).find((k) => CC[k] === id);
      p.addEventListener("click", () => { location.hash = "#/screening/" + iso2; });
    }
    g.appendChild(p);
  });
  svg.appendChild(g);
}

/* ================= screening ================= */
const PAGE = 60;
let CUR = [], SHOWN = PAGE, SEL = null;
function tokens(s) { return norm(s).split(" ").filter((x) => x.length > 1); }
function nameScore(q, e) {
  // Jaccard по токенам с бонусом за подстроку; максимум по имени и алиасам.
  const qt = tokens(q);
  if (!qt.length) return 0;
  let best = 0;
  const names = [e.nname || norm(e.name), ...(e.naliases || (e.aliases || []).map(norm))];
  for (const nm of names) {
    if (!nm) continue;
    const nt = nm.split(" ");
    const inter = qt.filter((x) => nt.some((y) => y === x || y.startsWith(x))).length;
    let sc = inter / Math.max(qt.length, nt.length);
    if (nm === qt.join(" ")) sc = 1;
    else if (nm.includes(qt.join(" ")) && qt.join(" ").length > 4) sc = Math.max(sc, 0.92);
    best = Math.max(best, sc);
  }
  return best;
}
function idHit(q, e) {
  const nq = q.replace(/[^0-9A-Za-zА-Яа-я]/g, "").toLowerCase();
  if (nq.length < 4) return false;
  return (e.identifiers || []).some((x) => String(x.value).replace(/[^0-9A-Za-zА-Яа-я]/g, "").toLowerCase().includes(nq));
}
function parseDobInput(s) {
  s = s.trim();
  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})\.(\d{4})$/);
  if (m) return `${m[2]}-${m[1].padStart(2, "0")}`;
  if (/^\d{4}$/.test(s)) return s;
  return s;
}
function runSearch() {
  if (!READY) return;
  const q = $("q").value.trim();
  const src = $("fSource").value, ty = $("fType").value;
  const cc = $("advCountry").value, dob = parseDobInput($("advDob").value);
  const doc = $("advDoc").value.trim(), imo = $("advImo").value.trim();
  const advN = [cc, $("advDob").value.trim(), doc, imo].filter(Boolean).length;
  $("advN").hidden = !advN; $("advN").textContent = advN;
  let pool = ALL;
  const t0 = performance.now();
  let scored;
  if (q) {
    const nq = norm(q);
    // кандидатная выборка: префиксный индекс + идентификаторы/программы полным проходом
    const cands = new Set();
    const first2 = nq.slice(0, 2);
    (NAME_IDX.get(first2) || []).forEach((i) => cands.add(i));
    // если имя на кириллице/другое — индекс покрывает; дополнительно сканируем идентификаторы и программы при длине ≥4
    const scanAll = q.replace(/\W/g, "").length >= 4;
    scored = [];
    const consider = (e) => {
      if (src && e.src !== src) return;
      if (ty && e.type !== ty) return;
      if (cc && !(e.countries || []).includes(cc)) return;
      if (dob && !(e.dobs || [e.dob]).filter(Boolean).some((d) => d.startsWith(dob))) return;
      if (doc && !idHit(doc, e)) return;
      if (imo && !idHit(imo, e)) return;
      let sc = nameScore(q, e);
      if ((e.programs || []).some((p) => norm(p).includes(nq))) sc = Math.max(sc, 0.75);
      if (idHit(q, e)) sc = Math.max(sc, 0.95);
      if (sc >= 0.34) scored.push([sc, e]);
    };
    cands.forEach((i) => consider(ALL[i]));
    if (scanAll || !cands.size) ALL.forEach((e) => { if (!cands.has(e._i)) consider(e); });
    scored.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name));
  } else {
    scored = [];
    ALL.forEach((e) => {
      if (src && e.src !== src) return;
      if (ty && e.type !== ty) return;
      if (cc && !(e.countries || []).includes(cc)) return;
      if (dob && !(e.dobs || [e.dob]).filter(Boolean).some((d) => d.startsWith(dob))) return;
      if (doc && !idHit(doc, e)) return;
      if (imo && !idHit(imo, e)) return;
      scored.push([1, e]);
    });
    scored.sort((a, b) => a[1].name.localeCompare(b[1].name));
  }
  CUR = scored; SHOWN = PAGE;
  const active = q || src || ty || cc || dob || doc || imo;
  const rf = $("rFilter");
  if (active) {
    const parts = [];
    if (q) parts.push(`«${esc(q)}»`);
    if (src) parts.push(src);
    if (ty) parts.push(TYPE_LABEL(ty));
    if (cc) parts.push(`${t("filter_country")}: ${cc}`);
    if (dob) parts.push(`${t("dob")}: ${esc(dob)}`);
    rf.hidden = false;
    rf.innerHTML = parts.map((p) => `<span class="chip">${p}</span>`).join("") + `<button class="x" id="rReset">${t("reset")}</button>`;
    $("rReset").onclick = resetSearch;
  } else rf.hidden = true;
  renderResults(t0, active);
  renderDetail(null);
}
function renderResults(t0, active) {
  const box = $("results");
  if (!active) {
    $("searchMeta").textContent = "";
    box.innerHTML = `<div class="empty"><div class="big">${t("enter_query")}</div>${t("enter_hint")}</div>`;
    return;
  }
  const ms = Math.max(1, Math.round(performance.now() - t0));
  $("searchMeta").textContent = `${t("found")} ${fmt(CUR.length)} ${t("records")} · ${ms} ${LANG === "ru" ? "мс" : "ms"}${CUR.length > SHOWN ? " · " + t("showing") + " " + SHOWN : ""}`;
  if (!CUR.length) {
    box.innerHTML = `<div class="empty"><div class="big">${t("nothing")}</div>${t("try_other")}</div>`;
    return;
  }
  const q = $("q").value.trim();
  box.innerHTML = CUR.slice(0, SHOWN).map(([sc, e], i) => {
    let nm = esc(e.name);
    if (q) {
      tokens(q).forEach((tok) => {
        if (tok.length < 2) return;
        nm = nm.replace(new RegExp("(" + tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\wа-яё-]*)", "gi"), "<mark>$1</mark>");
      });
    }
    const meas = (e.measures || []).map((m) => `<span class="mchip ${m}">${t(M_LABEL[m])}</span>`).join("");
    return `<div class="rcard${SEL === e.id ? " sel" : ""}" data-i="${i}" tabindex="0">
      <div class="top-line"><span class="chip src">${e.src}</span><span class="nm">${nm}</span><span class="chip">${TYPE_LABEL(e.type)}</span></div>
      <div class="sub">${(e.countries || []).length ? `<span>${esc(e.countries.join(", "))}</span>` : ""}${e.dob ? `<span>${t("dob")}: ${esc(e.dob)}</span>` : ""}${e.date ? `<span>${esc(e.date)}</span>` : ""}</div>
      <div class="prog">${(e.programs || []).slice(0, 3).map((p) => `<span class="chip">${esc(p)}</span>`).join("")}${meas}</div>
    </div>`;
  }).join("") + (CUR.length > SHOWN ? `<button class="btn" id="moreRes" style="align-self:center">${t("showing")} ${SHOWN} / ${fmt(CUR.length)} →</button>` : "");
  box.querySelectorAll(".rcard").forEach((c) => {
    const open = () => { SEL = CUR[+c.dataset.i][1].id; renderDetail(CUR[+c.dataset.i][1]); box.querySelectorAll(".rcard").forEach((x) => x.classList.remove("sel")); c.classList.add("sel"); };
    c.addEventListener("click", open);
    c.addEventListener("keydown", (ev) => { if (ev.key === "Enter") open(); });
  });
  const more = $("moreRes");
  if (more) more.onclick = () => { SHOWN += PAGE; renderResults(t0, active); };
}
function resetSearch() {
  ["q", "advDob", "advDoc", "advImo"].forEach((id) => $(id).value = "");
  $("fSource").value = ""; $("fType").value = ""; $("advCountry").value = "";
  history.replaceState(null, "", "#/screening");
  runSearch();
}
function dsec(title, body) { return body ? `<div class="dsec"><div class="t">${title}</div><div class="v">${body}</div></div>` : ""; }
function renderDetail(e) {
  const el = $("detail");
  if (!e) { el.innerHTML = `<div class="dbody muted" style="padding:26px 22px">${t("sel_hint")}</div>`; return; }
  const kv = [];
  if (e.dobs?.length || e.dob) kv.push([t("dob"), esc((e.dobs || [e.dob]).join(", "))]);
  if (e.pob?.length) kv.push([t("pob"), esc(e.pob.join("; "))]);
  if (e.gender?.length) kv.push([t("gender"), esc(e.gender.join(", "))]);
  if (e.positions?.length) kv.push([t("position"), esc(e.positions.join("; "))]);
  if (e.date) kv.push([t("listed"), esc(e.date)]);
  const ids = (e.id_details?.length ? e.id_details : (e.identifiers || []).map((x) => ({ label: x.type, value: x.value })))
    .map((x) => `<div class="row"><span class="muted">${esc(x.label || x.kind)}:</span> <span class="mono">${esc(x.value)}</span></div>`).join("");
  const contacts = [
    ...(e.emails || []).map((x) => `<div class="row mono">${esc(x)}</div>`),
    ...(e.phones || []).map((x) => `<div class="row mono">${esc(x)}</div>`),
    ...(e.websites || []).map((x) => `<div class="row"><a href="${esc(x)}" target="_blank" rel="noopener">${esc(x)}</a></div>`),
  ].join("");
  el.innerHTML = `
    <div class="dhead">
      <span class="chip src">${e.src}</span> <span class="chip">${TYPE_LABEL(e.type)}</span>
      <h3>${esc(e.name)}</h3>
      <div class="muted small">${esc((e.countries || []).join(", "))}</div>
    </div>
    <div class="dbody">
      ${kv.length ? `<div class="dsec"><div class="kv">${kv.map(([k, v]) => `<span class="k">${k}</span><span>${v}</span>`).join("")}</div></div>` : ""}
      ${dsec(t("programs"), (e.programs || []).map((p) => `<span class="chip" style="margin:0 5px 5px 0">${esc(p)}</span>`).join(""))}
      ${dsec(t("measures"), (e.measures || []).map((m) => `<span class="mchip ${m}">${t(M_LABEL[m])}</span>`).join(""))}
      ${dsec(t("aliases"), e.aliases?.length ? `<ul class="alias-list">${e.aliases.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : "")}
      ${dsec(t("ids"), ids)}
      ${dsec(t("addresses"), (e.addresses || []).map((a) => `<div class="row">${esc(a)}</div>`).join(""))}
      ${dsec(t("contacts"), contacts)}
      ${dsec(t("topics"), (e.topics || []).map((x) => `<span class="chip" style="margin:0 5px 5px 0">${esc(x)}</span>`).join(""))}
      ${dsec(t("notes"), e.notes ? `<div class="notes-box">${esc(e.notes)}</div>` : "")}
      <div class="dsrc"><a href="${esc(e.source_url)}" target="_blank" rel="noopener">${t("open_src")} ↗</a></div>
    </div>`;
  if (window.innerWidth < 1000) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ================= tooltips ================= */
let TIP_BTN = null;
function smartPlace(tip, r, forceBelow = false) {
  const vw = window.innerWidth, vh = window.innerHeight;
  tip.style.maxHeight = ""; tip.style.left = "0px"; tip.style.top = "0px";
  const w = Math.min(290, vw - 20), h = tip.offsetHeight;
  let left = Math.min(Math.max(10, r.left + r.width / 2 - w / 2), vw - w - 10);
  const below = vh - r.bottom - 10, above = r.top - 10;
  let top = r.bottom + 8;
  if (!forceBelow && h > below && above > below) { top = Math.max(8, r.top - 8 - h); if (h > above) tip.style.maxHeight = above + "px"; }
  else if (h > below) tip.style.maxHeight = (forceBelow ? Math.max(40, below) : Math.max(120, below)) + "px";
  tip.style.left = left + "px"; tip.style.top = top + "px";
}
function initTips() {
  const tip = $("advTip");
  document.addEventListener("mouseover", (ev) => {
    const btn = ev.target.closest(".adv-info");
    if (!btn || btn === TIP_BTN) return;
    TIP_BTN = btn;
    tip.textContent = t(btn.dataset.tip);
    tip.classList.add("on");
    smartPlace(tip, btn.getBoundingClientRect(), btn.dataset.place === "below");
  });
  document.addEventListener("mouseout", (ev) => {
    if (TIP_BTN && ev.target.closest(".adv-info") === TIP_BTN) { tip.classList.remove("on"); TIP_BTN = null; }
  });
  document.addEventListener("focusin", (ev) => {
    const btn = ev.target.closest(".adv-info");
    if (btn) { TIP_BTN = btn; tip.textContent = t(btn.dataset.tip); tip.classList.add("on"); smartPlace(tip, btn.getBoundingClientRect(), btn.dataset.place === "below"); }
  });
  document.addEventListener("focusout", () => { tip.classList.remove("on"); TIP_BTN = null; });
  window.addEventListener("scroll", () => { tip.classList.remove("on"); TIP_BTN = null; }, true);
}

/* ================= sources ================= */
const PRIMARY = {
  US: "https://sanctionslist.ofac.treas.gov/", EU: "https://webgate.ec.europa.eu/fsd/fsf", UK: "https://www.gov.uk/government/publications/the-uk-sanctions-list",
  CH: "https://www.seco.admin.ch/seco/en/home/Aussenwirtschaftspolitik_Wirtschaftliche_Zusammenarbeit/Wirtschaftsbeziehungen/exportkontrollen-und-sanktionen/sanktionen-embargos.html",
  UN: "https://www.un.org/securitycouncil/content/un-sc-consolidated-list", AU: "https://www.dfat.gov.au/international-relations/security/sanctions",
  CA: "https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/", JP: "https://www.mof.go.jp/english/policy/international_policy/gaitame_kawase/gaitame/economic_sanctions/"
};
function renderSources() {
  if (!READY) return;
  $("sourcesTable").innerHTML = `<thead><tr><th>${t("src_list")}</th><th>${t("src_org")}</th><th>${t("src_country")}</th><th class="num">${t("src_count")}</th><th>${t("src_link")}</th></tr></thead><tbody>` +
    IDX.sources.map((s) => `<tr><td><span class="chip src">${s.code}</span> ${esc(s.name)}</td><td>${esc(s.org)}</td><td>${esc(s.country)}</td><td class="num">${fmt(s.count)}</td><td>${PRIMARY[s.code] ? `<a href="${PRIMARY[s.code]}" target="_blank" rel="noopener">↗</a>` : "—"}</td></tr>`).join("") + "</tbody>";
}

/* ================= changelog ================= */
let LOGS = null;
async function renderChangelog() {
  if (!LOGS) {
    try {
      const txt = await (await fetch("data/changelog/changes.jsonl")).text();
      LOGS = txt.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)).reverse();
    } catch (e) { LOGS = []; }
    try {
      const latest = await (await fetch("data/changelog/latest.json")).json();
      if (latest.baseline) LOGS.unshift(latest);
    } catch (e) {}
  }
  const el = $("changelog");
  if (!LOGS.length) { el.innerHTML = `<div class="empty">${t("log_empty")}</div>`; return; }
  el.innerHTML = LOGS.slice(0, 30).map((d) => {
    if (d.baseline) return `<div class="log-day">${esc(d.date)} <span class="chip">${t("log_baseline")}</span></div><div class="muted small">${fmt(d.counts.total)} ${t("records")}</div>`;
    const rows = [
      ...(d.added || []).slice(0, 50).map((e) => `<tr><td><span class="chip ok">+</span></td><td>${esc(e.name)}</td><td><span class="chip src">${e.src}</span></td><td>${esc((e.programs || []).join(", "))}</td></tr>`),
      ...(d.removed || []).slice(0, 50).map((e) => `<tr><td><span class="chip bad">−</span></td><td>${esc(e.name)}</td><td><span class="chip src">${e.src}</span></td><td></td></tr>`),
      ...(d.modified || []).slice(0, 50).map((e) => `<tr><td><span class="chip warn">~</span></td><td>${esc(e.name)}</td><td><span class="chip src">${e.src}</span></td><td></td></tr>`),
    ].join("");
    return `<div class="log-day">${esc(d.date)}</div>
      <div class="log-stats"><span class="chip ok">${t("log_added")}: ${d.counts.added}</span><span class="chip bad">${t("log_removed")}: ${d.counts.removed}</span><span class="chip warn">${t("log_modified")}: ${d.counts.modified}</span></div>
      <div class="tblwrap"><table class="tbl"><tbody>${rows}</tbody></table></div>`;
  }).join("");
}
function exportLogCsv() {
  const rows = [["date", "change", "name", "source", "programs"]];
  (LOGS || []).forEach((d) => {
    (d.added || []).forEach((e) => rows.push([d.date, "added", e.name, e.src, (e.programs || []).join("|")]));
    (d.removed || []).forEach((e) => rows.push([d.date, "removed", e.name, e.src, ""]));
    (d.modified || []).forEach((e) => rows.push([d.date, "modified", e.name, e.src, ""]));
  });
  downloadCsv(rows, "sanctionswatch-changelog.csv");
}

/* ================= batch ================= */
let bRows = [], bHeaders = [], bFileName = "", bMap = { name: 0, country: -1, dob: -1, id: -1 }, bResults = [], bFilter = "all", bExpanded = new Set();
const bEls = {};
function bInit() {
  ["bUploadPanel", "bMapPanel", "bResPanel", "bDrop", "bFile", "bMap", "bPreview", "bFileInfo", "bSum", "bResTable", "bResFilter"].forEach((id) => bEls[id] = $(id));
  const dz = bEls.bDrop;
  dz.addEventListener("click", () => bEls.bFile.click());
  dz.addEventListener("keydown", (e) => { if (e.key === "Enter") bEls.bFile.click(); });
  ["dragover", "dragenter"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("over"); }));
  ["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, () => dz.classList.remove("over")));
  dz.addEventListener("drop", (e) => { e.preventDefault(); if (e.dataTransfer.files[0]) bRead(e.dataTransfer.files[0]); });
  bEls.bFile.addEventListener("change", () => { if (bEls.bFile.files[0]) bRead(bEls.bFile.files[0]); });
  $("bTpl").onclick = bTemplate;
  $("bBack").onclick = () => { bEls.bMapPanel.hidden = true; bEls.bUploadPanel.hidden = false; };
  $("bRun").onclick = bRun;
  $("bExport").onclick = bExportXlsx;
  $("bExportCsv").onclick = bExportCsv;
  $("bAgain").onclick = () => { bEls.bResPanel.hidden = true; bEls.bUploadPanel.hidden = false; bEls.bFile.value = ""; };
}
function bTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([["Name", "Country", "DOB", "ID"], ["Иванов Иван Иванович", "RU", "01.01.1970", ""], ["Example Trading LLC", "AE", "", ""]]);
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Screening");
  XLSX.writeFile(wb, "sanctionswatch-template.xlsx");
}
async function bRead(file) {
  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
    if (!aoa.length) throw new Error("empty");
    bHeaders = aoa[0].map((h, i) => String(h || `Column ${i + 1}`));
    bRows = aoa.slice(1).filter((r) => r.some((c) => String(c).trim()));
    bFileName = file.name;
    bAutoMap();
    bRenderMap();
    bEls.bUploadPanel.hidden = true; bEls.bMapPanel.hidden = false; bEls.bResPanel.hidden = true;
  } catch (e) { console.error(e); toast(t("b_badfile")); }
}
function bAutoMap() {
  const n = bHeaders.map((h) => norm(h));
  const find = (re) => n.findIndex((h) => re.test(h));
  bMap.name = find(/^(name|имя|название|наименование|фио|контрагент|company|entity|полное)/);
  if (bMap.name < 0) bMap.name = 0;
  bMap.country = find(/country|страна|граждан/);
  bMap.dob = find(/dob|birth|рожд/);
  bMap.id = find(/(^id$|идентиф|инн|inn|imo|рег|passport|паспорт|огрн|tax)/);
}
function bRenderMap() {
  bEls.bFileInfo.textContent = `${bFileName} · ${fmt(bRows.length)} ${t("records")}`;
  const opts = (sel, skip) => `<option value="-1">${t("b_skip")}</option>` + bHeaders.map((h, i) => `<option value="${i}"${i === sel ? " selected" : ""}>${esc(h)}</option>`).join("");
  const fields = [["name", t("b_col_name")], ["country", t("b_col_country")], ["dob", t("b_col_dob")], ["id", t("b_col_id")]];
  bEls.bMap.innerHTML = fields.map(([k, lab]) => `<label>${lab}<select data-k="${k}">${opts(bMap[k])}</select></label>`).join("");
  bEls.bMap.querySelectorAll("select").forEach((s) => s.addEventListener("change", () => { bMap[s.dataset.k] = +s.value; bPreview(); }));
  bPreview();
}
function bPreview() {
  bEls.bPreview.innerHTML = "<thead><tr>" + bHeaders.map((h) => `<th>${esc(h)}</th>`).join("") + "</tr></thead><tbody>" +
    bRows.slice(0, 8).map((r) => "<tr>" + bHeaders.map((_, i) => `<td>${esc(r[i])}</td>`).join("") + "</tr>").join("") + "</tbody>";
}
async function bRun() {
  if (!READY) return;
  const runBtn = $("bRun"); runBtn.disabled = true; runBtn.textContent = "…";
  await new Promise((r) => setTimeout(r, 30));
  bResults = [];
  const chunk = 200;
  for (let start = 0; start < bRows.length; start += chunk) {
    const end = Math.min(start + chunk, bRows.length);
    for (let i = start; i < end; i++) bResults.push(bMatchRow(bRows[i], i));
    runBtn.textContent = `${Math.min(end, bRows.length)} / ${bRows.length}`;
    await new Promise((r) => setTimeout(r, 0));
  }
  runBtn.disabled = false; runBtn.textContent = t("b_run");
  bFilter = "all"; bExpanded = new Set();
  bEls.bMapPanel.hidden = true; bEls.bResPanel.hidden = false;
  bRender();
  toast(t("b_done"));
}
function bMatchRow(row, idx) {
  const name = String(row[bMap.name] || "").trim();
  const country = bMap.country >= 0 ? String(row[bMap.country] || "").trim().toUpperCase() : "";
  const dob = bMap.dob >= 0 ? parseDobInput(String(row[bMap.dob] || "")) : "";
  const idv = bMap.id >= 0 ? String(row[bMap.id] || "").trim() : "";
  const hits = new Map();
  const nq = norm(name);
  const cands = new Set();
  (NAME_IDX.get(nq.slice(0, 2)) || []).forEach((i) => cands.add(i));
  ALL.forEach((e) => { if (idv && idHit(idv, e)) cands.add(e._i); });
  cands.forEach((i) => {
    const e = ALL[i];
    let sc = name ? nameScore(name, e) : 0;
    const idhit = idv && idHit(idv, e);
    if (idhit) sc = Math.max(sc, 0.96);
    if (country && !(e.countries || []).includes(country)) {
      if (sc < 0.99) sc *= 0.55;
    }
    if (dob) {
      const ds = (e.dobs || [e.dob]).filter(Boolean);
      if (ds.length && !ds.some((d) => d.startsWith(dob))) sc *= 0.3;
      else if (ds.length) sc = Math.min(1, sc + 0.08);
    }
    // Сохраняем все списки, а не только первую/лучшую запись.
    if (sc >= 0.6) hits.set(e.id, { sc, e, idhit: !!idhit });
  });
  const matches = [...hits.values()].sort((a, b) => b.sc - a.sc || a.e.name.localeCompare(b.e.name));
  const best = matches[0];
  let status = "clean";
  if (best && (best.sc >= 0.86 || (best.idhit && best.sc >= 0.8))) status = "match";
  else if (best && best.sc >= 0.6) status = "review";
  return {
    idx, input: row, name, country, dob, id: idv, status,
    score: best ? Math.round(best.sc * 100) : 0,
    e: best ? best.e : null,
    sources: matches.map((m) => m.e.src),
    matches,
  };
}
function bRender() {
  const counts = { all: bResults.length, match: 0, review: 0, clean: 0 };
  bResults.forEach((r) => counts[r.status]++);
  bEls.bSum.innerHTML = ["match", "review", "clean"].map((s) => `<span class="chip ${s === "match" ? "bad" : s === "review" ? "warn" : "ok"}">${t("st_" + s)}: ${fmt(counts[s])}</span>`).join("");
  bEls.bResFilter.innerHTML = ["all", "match", "review", "clean"].map((s) => `<button class="rf-btn${bFilter === s ? " on" : ""}" data-f="${s}">${t("b_" + s)} (${fmt(counts[s])})</button>`).join("");
  bEls.bResFilter.querySelectorAll("button").forEach((b) => b.onclick = () => { bFilter = b.dataset.f; bRender(); });
  const rows = bResults.filter((r) => bFilter === "all" || r.status === bFilter);
  bEls.resTable.innerHTML = `<thead><tr><th>#</th><th>${t("r_name")}</th><th>${t("r_status")}</th><th>${t("r_matches_n")}</th><th>${t("r_matched")}</th><th>${t("r_source")}</th><th>${t("r_score")}</th><th>${t("programs")}</th><th>${t("measures")}</th></tr></thead><tbody>` + rows.map((r) => {
    const e = r.e;
    const st = `<span class="chip ${r.status === "match" ? "bad" : r.status === "review" ? "warn" : "ok"}">${t("st_" + r.status)}</span>`;
    const open = bExpanded.has(r.idx);
    const main = `<tr data-ri="${r.idx}" class="${open ? "b-open" : ""}" title="${t("b_open_title")}">
      <td>${r.idx + 1}</td><td>${esc(r.name || "—")}${r.country ? ` <span class="muted">${esc(r.country)}</span>` : ""}${r.id ? `<div class="prog-mini mono">${esc(r.id)}</div>` : ""}</td>
      <td>${st}</td><td class="num">${r.matches.length || "—"}</td><td>${e ? esc(e.name) : "—"}</td><td>${r.sources.map((s) => `<span class="chip src">${s}</span>`).join(" ") || "—"}</td><td class="num">${r.score || "—"}</td>
      <td>${e ? esc((e.programs || []).slice(0, 2).join(", ")) : ""}</td>
      <td>${e ? (e.measures || []).map((m) => `<span class="mchip ${m}">${t(M_LABEL[m])}</span>`).join("") : ""}</td></tr>`;
    return main + (open ? bDetailRow(r) : "");
  }).join("") + "</tbody>";
  bEls.resTable.querySelectorAll("tr[data-ri]").forEach((tr) => {
    tr.addEventListener("click", () => {
      const idx = +tr.dataset.ri;
      if (bExpanded.has(idx)) bExpanded.delete(idx); else bExpanded.add(idx);
      bRender();
    });
  });
  bInitColResize();
  bEls.resTable.querySelectorAll(".b-detailtbl").forEach((tbl) => bInitColResize(tbl));
}
function bDetailRow(r) {
  const rows = r.matches.map((m, i) => {
    const e = m.e;
    return `<tr><td>${i + 1}</td><td><span class="chip src">${esc(e.src)}</span></td><td>${esc(e.name)}${(e.aliases || []).length ? `<div class="prog-mini">${esc(e.aliases.slice(0, 2).join("; "))}</div>` : ""}</td><td>${e.date ? esc(e.date) : "—"}</td><td>${esc((e.programs || []).join(", ")) || "—"}</td><td>${(e.measures || []).map((x) => `<span class="mchip ${x}">${t(M_LABEL[x])}</span>`).join("") || "—"}</td><td class="num">${Math.round(m.sc * 100)}${m.idhit ? " · ID" : ""}</td></tr>`;
  }).join("");
  return `<tr class="b-detail-row"><td colspan="9"><div class="b-details"><div class="small b-details-title" style="font-weight:600;margin-bottom:10px">${t("b_details_title")}<button class="info-i adv-info b-detail-info" type="button" data-tip="b_detail_note" data-place="below" aria-label="i"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="12" y1="10.5" x2="12" y2="16.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="7.2" r="1.3" fill="currentColor"/></svg></button></div><div class="tblwrap b-detail-scroll"><table class="b-detailtbl"><thead><tr><th>#</th><th>${t("r_source")}</th><th>${t("r_matched")}</th><th>${t("listed")}</th><th>${t("programs")}</th><th>${t("measures")}</th><th>${t("r_score")}</th></tr></thead><tbody>${rows}</tbody></table></div></div></td></tr>`;
}
function bInitColResize(tbl = bEls.resTable) {
  tbl.querySelectorAll(".colrsz").forEach((h) => h.remove());
  const ths = [...tbl.querySelector("tr").querySelectorAll(":scope > th")];
  ths.forEach((th, i) => {
    if (i === ths.length - 1) return;
    const h = document.createElement("span"); h.className = "colrsz";
    h.addEventListener("pointerdown", (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      h.setPointerCapture(ev.pointerId);
      const startX = ev.clientX, startW = th.getBoundingClientRect().width;
      const move = (e) => {
        const w = Math.max(56, startW + e.clientX - startX);
        let cg = tbl.querySelector("colgroup");
        if (!cg) {
          cg = document.createElement("colgroup");
          [...tbl.querySelector("tr").children].forEach((c) => { const col = document.createElement("col"); col.style.width = c.getBoundingClientRect().width + "px"; cg.appendChild(col); });
          tbl.insertBefore(cg, tbl.firstChild); tbl.classList.add("fixed");
        }
        cg.children[i].style.width = w + "px";
      };
      const up = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); };
      document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
    });
    h.addEventListener("click", (e) => e.stopPropagation());
    th.appendChild(h);
  });
}
// --- экспорт: сводка + детализация по строкам текущего фильтра ---
function bExportRows() {
  return (bResults || []).filter((r) => bFilter === "all" || r.status === bFilter);
}

function bSummaryAoa() {
  const head = ["#", t("r_name"), t("country"), t("dob"), "ID", t("r_status"), t("r_matches_n"), t("r_matched"), t("r_source"), t("r_score"), t("programs"), t("measures")];
  const aoa = [head];
  for (const r of bExportRows()) {
    const e = r.e;
    aoa.push([r.idx + 1, r.name, r.country, r.dob, r.id, t("st_" + r.status), r.matches.length,
      e ? e.name : "", r.sources.join(", "), r.score || "", e ? (e.programs || []).join(", ") : "",
      e ? (e.measures || []).map((m) => t(M_LABEL[m])).join(", ") : ""]);
  }
  return aoa;
}
function bDetailAoa() {
  const head = ["#", t("r_name"), t("r_status"), t("b_record"), t("r_source"), t("r_matched"), t("listed"), t("programs"), t("measures"), t("r_score")];
  const aoa = [head];
  for (const r of bExportRows()) {
    r.matches.forEach((m, i) => {
      const e = m.e;
      aoa.push([r.idx + 1, r.name, t("st_" + r.status), i + 1, e.src, e.name, e.date || "",
        (e.programs || []).join(", "), (e.measures || []).map((x) => t(M_LABEL[x])).join(", "),
        Math.round(m.sc * 100)]);
    });
  }
  return aoa;
}
function bExportXlsx() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(bSummaryAoa());
  ws["!cols"] = [{ wch: 5 }, { wch: 32 }, { wch: 9 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 38 }, { wch: 20 }, { wch: 9 }, { wch: 30 }, { wch: 26 }];
  XLSX.utils.book_append_sheet(wb, ws, "Результаты");
  const detail = XLSX.utils.aoa_to_sheet(bDetailAoa());
  detail["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 8 }, { wch: 9 }, { wch: 38 }, { wch: 12 }, { wch: 30 }, { wch: 26 }, { wch: 9 }];
  XLSX.utils.book_append_sheet(wb, detail, "Детализация");
  XLSX.writeFile(wb, "sanctionswatch-batch.xlsx");
  toast(t("b_exported"));
}
function bExportCsv() {
  downloadCsv(bDetailAoa(), "sanctionswatch-batch.csv");
  toast(t("b_exported"));
}

/* ================= download ================= */
function downloadCsv(rows, fname) {
  const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = fname; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* ================= boot ================= */
async function boot() {
  applyTheme();
  $("themeToggle").onclick = () => { localStorage.setItem("sw_theme", document.documentElement.dataset.theme === "dark" ? "light" : "dark"); applyTheme(); if (READY && location.hash.includes("dashboard")) drawMap(); };
  $("langToggle").onclick = () => { LANG = LANG === "ru" ? "en" : "ru"; localStorage.setItem("sw_lang", LANG); applyI18n(); route(); if (SEL) { const e = ALL.find((x) => x.id === SEL); if (e) renderDetail(e); } };
  window.addEventListener("hashchange", route);
  const deb = debounce(runSearch, 220);
  $("q").addEventListener("input", () => { $("qClear").hidden = !$("q").value; deb(); });
  $("qClear").onclick = () => { $("q").value = ""; $("qClear").hidden = true; runSearch(); };
  ["fSource", "fType", "advCountry"].forEach((id) => $(id).addEventListener("change", runSearch));
  ["advDob", "advDoc", "advImo"].forEach((id) => $(id).addEventListener("input", debounce(runSearch, 260)));
  $("advToggle").onclick = () => { const p = $("advPanel"); p.hidden = !p.hidden; $("advToggle").classList.toggle("on", !p.hidden); $("advToggle").setAttribute("aria-expanded", String(!p.hidden)); };
  $("advReset").onclick = () => { ["advDob", "advDoc", "advImo"].forEach((id) => $(id).value = ""); $("advCountry").value = ""; runSearch(); };
  $("logCsv").onclick = exportLogCsv;
  bInit(); initTips(); applyI18n();
  try {
    await loadData();
    $("updated").textContent = `${t("updated")} ${IDX.date}`;
    $("fSource").innerHTML = `<option value="">${t("all_sources")}</option>` + IDX.sources.map((s) => `<option value="${s.code}">${s.code} — ${esc(s.name)}</option>`).join("");
    $("fType").innerHTML = `<option value="">${t("all_types")}</option>` + ["person", "org", "vessel", "aircraft", "crypto"].map((ty) => `<option value="${ty}">${TYPE_LABEL(ty)}</option>`).join("");
    $("advCountry").innerHTML = `<option value="">${t("adv_any")}</option>` + IDX.countries.map((c) => `<option value="${c}">${c}</option>`).join("");
    $("boot").remove();
    route();
  } catch (e) {
    console.error(e);
    $("boot").innerHTML = `<div class="big">${t("load_fail")}</div>`;
  }
}
document.addEventListener("DOMContentLoaded", boot);
