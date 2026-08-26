const { useState, useEffect, useCallback, useRef } = React;

// 画面幅を監視し、スマートフォンなど狭い画面では2カラムのレイアウトを
// 1カラムに切り替えるためのフック
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

/* ---------------------------------------------------------
   アイコン(lucideの外部依存を排し、自前SVGでオフライン完結)
   元のlucide-reactアイコンと同一の見た目になるよう
   ストローク系パスを再現している
--------------------------------------------------------- */
function makeIcon(paths) {
  return function Icon({ size = 18, color = "currentColor", style, ...rest }) {
    return React.createElement(
      "svg",
      {
        width: size, height: size, viewBox: "0 0 24 24",
        fill: "none", stroke: color, strokeWidth: 2,
        strokeLinecap: "round", strokeLinejoin: "round",
        style, ...rest,
      },
      paths.map((p, i) => React.createElement(p.tag, { key: i, ...p.attrs }))
    );
  };
}

const Settings = makeIcon([
  { tag: "path", attrs: { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" } },
  { tag: "circle", attrs: { cx: 12, cy: 12, r: 3 } },
]);
const Users = makeIcon([
  { tag: "path", attrs: { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" } },
  { tag: "circle", attrs: { cx: 9, cy: 7, r: 4 } },
  { tag: "path", attrs: { d: "M22 21v-2a4 4 0 0 0-3-3.87" } },
  { tag: "path", attrs: { d: "M16 3.13a4 4 0 0 1 0 7.75" } },
]);
const Clock = makeIcon([
  { tag: "circle", attrs: { cx: 12, cy: 12, r: 10 } },
  { tag: "polyline", attrs: { points: "12 6 12 12 16 14" } },
]);
const Plus = makeIcon([
  { tag: "path", attrs: { d: "M5 12h14" } },
  { tag: "path", attrs: { d: "M12 5v14" } },
]);
const Minus = makeIcon([{ tag: "path", attrs: { d: "M5 12h14" } }]);
const X = makeIcon([
  { tag: "path", attrs: { d: "M18 6 6 18" } },
  { tag: "path", attrs: { d: "m6 6 12 12" } },
]);
const Check = makeIcon([{ tag: "path", attrs: { d: "M20 6 9 17l-5-5" } }]);
const ArrowLeft = makeIcon([
  { tag: "path", attrs: { d: "m12 19-7-7 7-7" } },
  { tag: "path", attrs: { d: "M19 12H5" } },
]);
const Banknote = makeIcon([
  { tag: "rect", attrs: { x: 2, y: 6, width: 20, height: 12, rx: 2 } },
  { tag: "circle", attrs: { cx: 12, cy: 12, r: 2 } },
  { tag: "path", attrs: { d: "M6 12h.01M18 12h.01" } },
]);
const CreditCard = makeIcon([
  { tag: "rect", attrs: { x: 2, y: 5, width: 20, height: 14, rx: 2 } },
  { tag: "line", attrs: { x1: 2, x2: 22, y1: 10, y2: 10 } },
]);
const Wallet = makeIcon([
  { tag: "path", attrs: { d: "M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" } },
  { tag: "path", attrs: { d: "M18 12a2 2 0 0 0 0 4h4v-4Z" } },
]);
const Trash2 = makeIcon([
  { tag: "path", attrs: { d: "M3 6h18" } },
  { tag: "path", attrs: { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" } },
  { tag: "path", attrs: { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" } },
  { tag: "line", attrs: { x1: 10, x2: 10, y1: 11, y2: 17 } },
  { tag: "line", attrs: { x1: 14, x2: 14, y1: 11, y2: 17 } },
]);
const Pencil = makeIcon([
  { tag: "path", attrs: { d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" } },
]);
const ReceiptText = makeIcon([
  { tag: "path", attrs: { d: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" } },
  { tag: "path", attrs: { d: "M14 8H8M16 12H8M13 16H8" } },
]);
const Store = makeIcon([
  { tag: "path", attrs: { d: "m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" } },
  { tag: "path", attrs: { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" } },
  { tag: "path", attrs: { d: "M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" } },
  { tag: "path", attrs: { d: "M2 7h20" } },
  { tag: "path", attrs: { d: "M22 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" } },
  { tag: "path", attrs: { d: "M18 12v0a2 2 0 0 1-2-2V7" } },
  { tag: "path", attrs: { d: "M14 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" } },
  { tag: "path", attrs: { d: "M6 12v0a2 2 0 0 0 2-2V7" } },
]);
const AlertCircle = makeIcon([
  { tag: "circle", attrs: { cx: 12, cy: 12, r: 10 } },
  { tag: "line", attrs: { x1: 12, x2: 12, y1: 8, y2: 12 } },
  { tag: "line", attrs: { x1: 12, x2: 12.01, y1: 16, y2: 16 } },
]);
const Smartphone = makeIcon([
  { tag: "rect", attrs: { x: 5, y: 2, width: 14, height: 20, rx: 2 } },
  { tag: "path", attrs: { d: "M12 18h.01" } },
]);
const FileText = makeIcon([
  { tag: "path", attrs: { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" } },
  { tag: "path", attrs: { d: "M14 2v4a2 2 0 0 0 2 2h4" } },
  { tag: "path", attrs: { d: "M10 9H8M16 13H8M16 17H8" } },
]);
const Percent = makeIcon([
  { tag: "line", attrs: { x1: 19, x2: 5, y1: 5, y2: 19 } },
  { tag: "circle", attrs: { cx: 6.5, cy: 6.5, r: 2.5 } },
  { tag: "circle", attrs: { cx: 17.5, cy: 17.5, r: 2.5 } },
]);
const History = makeIcon([
  { tag: "path", attrs: { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" } },
  { tag: "path", attrs: { d: "M3 3v5h5" } },
  { tag: "path", attrs: { d: "M12 7v5l4 2" } },
]);
const Calendar = makeIcon([
  { tag: "rect", attrs: { x: 3, y: 4, width: 18, height: 18, rx: 2 } },
  { tag: "line", attrs: { x1: 16, x2: 16, y1: 2, y2: 6 } },
  { tag: "line", attrs: { x1: 8, x2: 8, y1: 2, y2: 6 } },
  { tag: "line", attrs: { x1: 3, x2: 21, y1: 10, y2: 10 } },
]);
const CalendarDays = makeIcon([
  { tag: "rect", attrs: { x: 3, y: 4, width: 18, height: 18, rx: 2 } },
  { tag: "line", attrs: { x1: 16, x2: 16, y1: 2, y2: 6 } },
  { tag: "line", attrs: { x1: 8, x2: 8, y1: 2, y2: 6 } },
  { tag: "line", attrs: { x1: 3, x2: 21, y1: 10, y2: 10 } },
  { tag: "path", attrs: { d: "M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" } },
]);
const Download = makeIcon([
  { tag: "path", attrs: { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" } },
  { tag: "polyline", attrs: { points: "7 10 12 15 17 10" } },
  { tag: "line", attrs: { x1: 12, x2: 12, y1: 15, y2: 3 } },
]);
const Printer = makeIcon([
  { tag: "polyline", attrs: { points: "6 9 6 2 18 2 18 9" } },
  { tag: "path", attrs: { d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" } },
  { tag: "rect", attrs: { x: 6, y: 14, width: 12, height: 8 } },
]);
const Lock = makeIcon([
  { tag: "rect", attrs: { x: 3, y: 11, width: 18, height: 11, rx: 2 } },
  { tag: "path", attrs: { d: "M7 11V7a5 5 0 0 1 10 0v4" } },
]);
const RefreshCw = makeIcon([
  { tag: "path", attrs: { d: "M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" } },
  { tag: "path", attrs: { d: "M3 3v5h5" } },
  { tag: "path", attrs: { d: "M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" } },
  { tag: "path", attrs: { d: "M16 16h5v5" } },
]);
const Ban = makeIcon([
  { tag: "circle", attrs: { cx: 12, cy: 12, r: 10 } },
  { tag: "path", attrs: { d: "m4.9 4.9 14.2 14.2" } },
]);

/* ---------------------------------------------------------
   デザイントークン(オーダーチケット / 伝票テイスト)
--------------------------------------------------------- */
const COLORS = {
  bg: "#EFEBE2",
  paper: "#FBF9F4",
  ink: "#20291F",
  inkSoft: "#5B6459",
  teal: "#1D4E4B",
  tealDark: "#123634",
  sage: "#4F7A5C",
  sageBg: "#E4EEE3",
  amber: "#C98A2B",
  amberBg: "#F7ECD8",
  brick: "#B54834",
  brickBg: "#F6E1DB",
  line: "#DCD4C4",
};

const MONO = "'SFMono-Regular','Menlo','Consolas',monospace";
const DISPLAY = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', sans-serif";

const STORAGE_KEY = "pos-app-data-v1";

// ヘッダーの時計表示のフォントサイズ(px)。タブレットのシステム時計と見た目上
// 重なってしまうため、アプリ全体をこの分だけ下にずらす(このファイル内の
// pos-app-shellのmarginTop/heightと、index.html内の対応するCSSで使用)。
const HEADER_CLOCK_FONT_SIZE = 11;

// コード自体を変更した日時(固定値)。マスタ設定画面にのみ表示する。
// コードを変更するたびに、この値を手動で現在日時に更新すること
// (CACHE_VERSIONのインクリメントとあわせて更新する運用)。
const APP_LAST_UPDATED = "2026/08/26 16:03";

const DEFAULT_PRODUCTS = [
  { id: "p1", name: "生ビール", price: 600, category: "ドリンク" },
  { id: "p2", name: "ハイボール", price: 500, category: "ドリンク" },
  { id: "p3", name: "サワー各種", price: 480, category: "ドリンク" },
  { id: "p4", name: "ウーロン茶", price: 400, category: "ドリンク" },
  { id: "p5", name: "枝豆", price: 350, category: "フード" },
  { id: "p6", name: "唐揚げ", price: 550, category: "フード" },
  { id: "p7", name: "焼き鳥盛合せ", price: 700, category: "フード" },
  { id: "p8", name: "刺身盛合せ", price: 900, category: "フード" },
  { id: "p9", name: "ポテトフライ", price: 450, category: "フード" },
  { id: "p10", name: "だし巻き玉子", price: 480, category: "フード" },
  { id: "p11", name: "本日のデザート", price: 500, category: "デザート" },
];

function defaultData() {
  return {
    products: DEFAULT_PRODUCTS,
    seatCount: 5,
    seats: {},
    seatNames: {},
    seatToneThresholds: { warnMinutes: 30, dangerMinutes: 60 }, // 座席カード色分けの分数閾値(緑→黄 / 黄→赤)
    salesHistory: [],
    serviceChargeRate: 0, // %
    taxRate: 10, // %
    payroll: { employees: [], shifts: [] },
    cashFlow: { records: {} }, // 日付(YYYY-MM-DD) -> { expenses:[], income:[] }
    security: {
      enabled: { salesManagement: false, payroll: false },
      mode: "shared", // "shared" | "individual"(2画面以上選択時のみ意味を持つ)
      lockMode: "session", // "session"(起動中は初回のみ) | "always"(タブを開くたび)
      passwords: { salesManagement: "", payroll: "" }, // PASSWORD_PREFIXを付与して保存
    },
  };
}

// パスワードは平文にPASSWORD_PREFIXを付与して保存する(ユーザー指定の仕様)。
// 暗号学的な保護ではなく、バックアップJSONを直接開いた際の簡易な難読化のみが目的。
const PASSWORD_PREFIX = "MIRIN";
function encodePassword(raw) {
  return PASSWORD_PREFIX + raw;
}
function decodePassword(stored) {
  return stored && stored.startsWith(PASSWORD_PREFIX) ? stored.slice(PASSWORD_PREFIX.length) : (stored || "");
}
function verifyPassword(enteredRaw, storedEncoded) {
  return !!storedEncoded && encodePassword(enteredRaw) === storedEncoded;
}

const SECURITY_SCREEN_ORDER = ["salesManagement", "payroll"];
const SECURITY_SCREEN_LABELS = { salesManagement: "売上管理", payroll: "アルバイト管理" };
const SECURITY_RESET_KEYWORD = "09044249596";
const SETTINGS_ADMIN_PASSWORD = "mrn"; // 「パスワード設定」タブ・JSON書き出しを保護する固定パスワード

// アプリデータ本体(localStorage)の容量の目安。ブラウザが保証する値ではなく、
// Chromium系ブラウザのlocalStorage上限(オリジンあたり5MB程度)を踏まえた保守的な目安値。
const APP_DATA_WARN_BYTES = 3 * 1024 * 1024; // 3MB: 注意
const APP_DATA_DANGER_BYTES = 4 * 1024 * 1024; // 4MB: 危険

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatYen(n) {
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  const units = ["KB", "MB", "GB"];
  let val = bytes / 1024;
  let i = 0;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

// 座席名が設定されていれば名前のみ、なければ番号にフォールバック
function seatDisplayLabel(n, seatName) {
  return seatName || `座席 ${n}`;
}

// companionは同伴時に選択したアルバイトの名前(文字列)。過去データの真偽値(companion:true)は
// 名前情報を持たないため空扱いにする。
function companionLabel(companion) {
  return typeof companion === "string" ? companion : "";
}

function formatElapsed(startIso, nowMs) {
  const start = new Date(startIso).getTime();
  const diff = Math.max(0, nowMs - start);
  const totalMin = Math.floor(diff / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}`;
  return `0:${String(m).padStart(2, "0")}`;
}

function elapsedMinutes(startIso, nowMs) {
  return Math.floor((nowMs - new Date(startIso).getTime()) / 60000);
}

function seatOrderTotal(seat) {
  if (!seat) return 0;
  return seat.orders.reduce((sum, o) => sum + o.price * o.qty, 0);
}

// 小計 → サービス料 → (小計+サービス料に対して)消費税 の順で計算
function computeBill(seat, data) {
  const subtotal = seatOrderTotal(seat);
  const serviceRate = data?.serviceChargeRate || 0;
  const taxRate = data?.taxRate || 0;
  const serviceCharge = Math.round(subtotal * (serviceRate / 100));
  const taxBase = subtotal + serviceCharge;
  const tax = Math.round(taxBase * (taxRate / 100));
  const total = taxBase + tax;
  return { subtotal, serviceRate, serviceCharge, taxRate, tax, total };
}

function formatPercent(n) {
  const v = Number(n) || 0;
  return Number.isInteger(v) ? `${v}%` : `${v.toFixed(1)}%`;
}

/* ---- 時間帯価格 ---- */
function parseHM(hm) {
  const [h, m] = (hm || "0:0").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function isTimeActive(timePrice, date) {
  if (!timePrice || !timePrice.start || !timePrice.end) return false;
  const cur = date.getHours() * 60 + date.getMinutes();
  const start = parseHM(timePrice.start);
  const end = parseHM(timePrice.end);
  if (start === end) return false;
  if (start < end) {
    return cur >= start && cur < end; // 通常の時間帯 (例 15:00-17:00)
  }
  return cur >= start || cur < end; // 日をまたぐ時間帯 (例 23:00-02:00)
}

function getEffectivePrice(product, date) {
  if (product.timePrice && isTimeActive(product.timePrice, date)) {
    return product.timePrice.price;
  }
  return product.price;
}

function seatTone(minutes, thresholds) {
  const warn = thresholds?.warnMinutes ?? 30;
  const danger = thresholds?.dangerMinutes ?? 60;
  if (minutes < warn) return { fg: COLORS.sage, bg: COLORS.sageBg, label: "" };
  if (minutes < danger) return { fg: COLORS.amber, bg: COLORS.amberBg, label: "" };
  return { fg: COLORS.brick, bg: COLORS.brickBg, label: "" };
}

function isToday(iso) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function toDateInputValue(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDate(iso, dateStr) {
  return toDateInputValue(iso) === dateStr;
}

// 「直近Nヶ月」の起点日(YYYY-MM-DD、操作時点を起点に月単位で遡る)を返す
function recentMonthsCutoff(months) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return toDateInputValue(d);
}

// バックアップJSON(restored)から、直近Nヶ月分の売上履歴・勤怠・入出金のみを抽出する
// (期間指定復元用。商品・座席・設定などのマスタはこの関数の対象外で、期間を絞らずそのまま全件復元される)
function filterRestoreDataByMonths(restored, months) {
  const cutoff = recentMonthsCutoff(months);
  const salesHistory = (restored.salesHistory || []).filter((s) => toDateInputValue(s.endTime) >= cutoff);
  const shifts = ((restored.payroll && restored.payroll.shifts) || []).filter((s) => s.date >= cutoff);
  const cashFlowRecords = {};
  Object.entries((restored.cashFlow && restored.cashFlow.records) || {}).forEach(([dateKey, v]) => {
    if (dateKey >= cutoff) cashFlowRecords[dateKey] = v;
  });
  return { salesHistory, shifts, cashFlowRecords };
}

function formatDateTimeShort(iso) {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${m}/${day} ${h}:${min}`;
}

function formatDateTimeRange(startIso, endIso) {
  return `${formatDateTimeShort(startIso)} ～ ${formatDateTimeShort(endIso)}`;
}

function formatTimeShort(iso) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

// ヘッダーに表示するシステム日時(YYYY/MM/DD HH:MM:SS)
function formatFullDateTime(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}/${m}/${day} ${h}:${min}:${s}`;
}

// CSVセル内にカンマ・改行・ダブルクォートが含まれる場合に備えたエスケープ
function csvEscape(value) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const BOM = String.fromCharCode(0xFEFF); // Excelで文字化けしないようUTF-8 BOMを付与

// rows(2次元配列。1行目はヘッダー)をCSVファイルとしてダウンロードする共通処理
function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([BOM + csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvTimestamp() {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

// 売上履歴(売上管理内の売上履歴タブ・マスタ設定の全件書き出し双方で使う行データ)
function salesHistoryToCsvRows(salesHistory) {
  const rows = [["会計ID", "日時", "座席", "人数", "同伴", "小計", "サービス料", "消費税", "合計", "現金", "カード", "PayPay", "ツケ", "メモ"]];
  (salesHistory || []).forEach((s) => {
    rows.push([
      s.id, s.endTime, seatDisplayLabel(s.seatId, s.seatName), s.guests, companionLabel(s.companion), s.subtotal, s.serviceCharge, s.tax, s.total,
      s.payments?.cash || 0, s.payments?.card || 0, s.payments?.paypay || 0, s.payments?.onAccount || 0,
      s.memo || "",
    ]);
  });
  return rows;
}

/* ---------------------------------------------------------
   共通パーツ
--------------------------------------------------------- */
function TicketButton({ children, onClick, variant = "primary", style, disabled, icon: Icon }) {
  const variants = {
    primary: { bg: COLORS.teal, fg: "#FBF9F4", border: COLORS.tealDark },
    ghost: { bg: "transparent", fg: COLORS.teal, border: COLORS.teal },
    danger: { bg: "transparent", fg: COLORS.brick, border: COLORS.brick },
    subtle: { bg: COLORS.paper, fg: COLORS.ink, border: COLORS.line },
  };
  const v = variants[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: v.bg,
        color: v.fg,
        border: `1.5px solid ${v.border}`,
        borderRadius: 8,
        padding: "12px 18px",
        fontSize: 15,
        fontWeight: 600,
        fontFamily: SANS,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "transform 0.08s ease, opacity 0.15s ease",
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {Icon && <Icon size={17} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

function HeaderClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return formatFullDateTime(now);
}

function Header({ title, onBack, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        background: COLORS.tealDark,
        color: "#FBF9F4",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: 6,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#FBF9F4",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: HEADER_CLOCK_FONT_SIZE, letterSpacing: 0.5, opacity: 0.65, fontFamily: MONO, whiteSpace: "nowrap" }}>
            <HeaderClock />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: DISPLAY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </div>
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
}

function HeaderIconButton({ icon: Icon, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "rgba(255,255,255,0.12)",
        border: "none",
        borderRadius: 6,
        width: 34,
        height: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#FBF9F4",
        flexShrink: 0,
      }}
    >
      <Icon size={18} />
    </button>
  );
}

const HOME_TABS = [
  { id: "seats", label: "座席一覧" },
  { id: "salesManagement", label: "売上管理" },
  { id: "payroll", label: "アルバイト管理" },
];

function HomeTabBar({ active, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "12px 20px", borderBottom: `1px solid ${COLORS.line}`, background: COLORS.paper, overflowX: "auto" }}>
      {HOME_TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: `1.5px solid ${active === t.id ? COLORS.teal : COLORS.line}`,
            background: active === t.id ? COLORS.teal : "transparent",
            color: active === t.id ? "#FBF9F4" : COLORS.inkSoft,
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: "nowrap",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: COLORS.tealDark,
        color: "#FBF9F4",
        padding: "10px 20px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Check size={16} /> {message}
    </div>
  );
}

/* ---------------------------------------------------------
   トップ画面(座席一覧)
--------------------------------------------------------- */
function TopScreen({ data, now, onSelectSeat, onOpenSettings, activeHomeTab, onSelectHomeTab }) {
  const todayTotal = data.salesHistory
    .filter((s) => isToday(s.endTime))
    .reduce((sum, s) => sum + s.total, 0);
  const todayCount = data.salesHistory.filter((s) => isToday(s.endTime)).length;

  const seatNums = Array.from({ length: data.seatCount }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header
        title="座席一覧"
        right={<HeaderIconButton icon={Settings} onClick={onOpenSettings} title="マスタ設定" />}
      />

      <HomeTabBar active={activeHomeTab} onSelect={onSelectHomeTab} />

      <div
        style={{
          padding: "10px 20px",
          display: "flex",
          gap: 20,
          alignItems: "center",
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 700,
          color: COLORS.inkSoft,
          borderBottom: `1px dashed ${COLORS.line}`,
          background: COLORS.paper,
        }}
      >
        <span>本日 会計 {todayCount}件</span>
        <span>売上 {formatYen(todayTotal)}</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(147px, 1fr))",
            gap: 14,
          }}
        >
          {seatNums.map((n) => {
            const seat = data.seats[n];
            const occupied = !!seat;
            const mins = occupied ? elapsedMinutes(seat.startTime, now) : 0;
            const tone = occupied ? seatTone(mins, data.seatToneThresholds) : { fg: COLORS.inkSoft, bg: COLORS.paper };
            const total = occupied ? seatOrderTotal(seat) : 0;
            const seatName = data.seatNames?.[n];

            return (
              <button
                key={n}
                onClick={() => onSelectSeat(n)}
                style={{
                  position: "relative",
                  textAlign: "left",
                  background: occupied ? tone.bg : COLORS.paper,
                  border: `1.5px solid ${occupied ? tone.fg : COLORS.line}`,
                  borderRadius: "6px 6px 12px 12px",
                  padding: "14px 14px 12px",
                  cursor: "pointer",
                  minHeight: 110,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  fontFamily: SANS,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 10,
                    right: 10,
                    height: 1,
                    backgroundImage: `repeating-linear-gradient(90deg, ${COLORS.line} 0 5px, transparent 5px 10px)`,
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 16,
                      fontWeight: 700,
                      color: COLORS.ink,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {seatDisplayLabel(n, seatName)}
                  </span>
                  {occupied && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontFamily: MONO, color: tone.fg, fontWeight: 700 }}>
                        ● 使用中
                      </span>
                      {companionLabel(seat.companion) && (
                        <span
                          style={{
                            fontSize: 12,
                            fontFamily: MONO,
                            fontWeight: 700,
                            color: COLORS.paper,
                            background: tone.fg,
                            borderRadius: 10,
                            padding: "1px 8px",
                          }}
                        >
                          {companionLabel(seat.companion)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {occupied ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: COLORS.inkSoft }}>
                      <Users size={12} /> {seat.guests}名
                      <Clock size={12} style={{ marginLeft: 6 }} />
                      <span style={{ fontFamily: MONO }}>{formatElapsed(seat.startTime, now)}</span>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: tone.fg }}>
                      {formatYen(total)}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: COLORS.inkSoft }}>空席・タップして開始</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   人数入力モーダル
--------------------------------------------------------- */
function GuestCountModal({ seatNum, employees, onConfirm, onCancel }) {
  const [count, setCount] = useState(2);
  const [companionOn, setCompanionOn] = useState(false);
  const [companionName, setCompanionName] = useState("");
  const quick = [1, 2, 3, 4, 5, 6, 8];

  useEffect(() => {
    if (!companionOn) {
      setCompanionName("");
    } else if (!companionName && employees.length > 0) {
      setCompanionName(employees[0].name);
    }
  }, [companionOn, employees]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,24,20,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: COLORS.paper,
          borderRadius: 12,
          padding: 26,
          width: "100%",
          maxWidth: 360,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          margin: "20px 0",
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 12, color: COLORS.inkSoft, marginBottom: 4 }}>
          SEAT {seatNum}
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: COLORS.ink, marginBottom: 18 }}>
          人数を入力
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
          {quick.map((q) => (
            <button
              key={q}
              onClick={() => setCount(q)}
              style={{
                padding: "12px 0",
                borderRadius: 8,
                border: `1.5px solid ${count === q ? COLORS.teal : COLORS.line}`,
                background: count === q ? COLORS.teal : "transparent",
                color: count === q ? "#FBF9F4" : COLORS.ink,
                fontWeight: 700,
                fontFamily: MONO,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 18 }}>
          <button
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            style={{ width: 38, height: 38, borderRadius: "50%", border: `1.5px solid ${COLORS.line}`, background: COLORS.paper, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Minus size={16} />
          </button>
          <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, minWidth: 50, textAlign: "center" }}>
            {count}名
          </span>
          <button
            onClick={() => setCount((c) => Math.min(99, c + 1))}
            style={{ width: 38, height: 38, borderRadius: "50%", border: `1.5px solid ${COLORS.line}`, background: COLORS.paper, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Plus size={16} />
          </button>
        </div>

        <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: companionOn ? 10 : 22, cursor: "pointer" }}>
          <input type="checkbox" checked={companionOn} onChange={(e) => setCompanionOn(e.target.checked)} style={{ width: 16, height: 16 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink }}>同伴</span>
        </label>

        {companionOn && (
          <div style={{ marginBottom: 22 }}>
            {employees.length === 0 ? (
              <div style={{ fontSize: 12, color: COLORS.inkSoft, textAlign: "center" }}>
                先に「アルバイトマスタ」でスタッフを登録してください。
              </div>
            ) : (
              <select
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: `1.5px solid ${COLORS.line}`,
                  fontSize: 14,
                  fontFamily: SANS,
                  color: COLORS.ink,
                  background: COLORS.paper,
                }}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <TicketButton variant="ghost" onClick={onCancel} style={{ flex: 1 }}>キャンセル</TicketButton>
          <TicketButton variant="primary" onClick={() => onConfirm(count, companionOn ? companionName : "")} style={{ flex: 1 }}>開始する</TicketButton>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel = "OK", onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,24,20,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 150,
        padding: 20,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: COLORS.paper,
          borderRadius: 12,
          padding: 26,
          width: "100%",
          maxWidth: 360,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          margin: "20px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <AlertCircle size={20} color={COLORS.brick} />
          <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: COLORS.ink }}>
            {title}
          </div>
        </div>
        <div style={{ fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 22 }}>
          {message}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <TicketButton variant="ghost" onClick={onCancel} style={{ flex: 1 }}>キャンセル</TicketButton>
          <TicketButton variant="danger" onClick={onConfirm} style={{ flex: 1, background: COLORS.brick, color: "#FBF9F4" }}>
            {confirmLabel}
          </TicketButton>
        </div>
      </div>
    </div>
  );
}

// 対象画面(売上管理・アルバイト管理)を開く際のパスワード入力モーダル
function PasswordPromptModal({ label, stored, title, message, onCancel, onSuccess }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (verifyPassword(value, stored)) {
      onSuccess();
    } else {
      setError("パスワードが違います。");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,24,20,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 150,
        padding: 20,
      }}
    >
      <div
        style={{
          background: COLORS.paper,
          borderRadius: 14,
          padding: 28,
          width: "100%",
          maxWidth: 320,
          textAlign: "center",
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: COLORS.sageBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Lock size={22} color={COLORS.sage} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 700, color: COLORS.ink, marginBottom: 6 }}>
          {title || "パスワードが必要です"}
        </div>
        <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginBottom: 20, lineHeight: 1.6 }}>
          {message || `「${label}」を開くにはパスワードを入力してください。`}
        </div>
        <input
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
          autoFocus
          style={{
            width: "100%", padding: 12, borderRadius: 8, border: `1.5px solid ${COLORS.line}`,
            fontFamily: MONO, fontSize: 16, textAlign: "center", letterSpacing: 4, color: COLORS.ink, marginBottom: 10,
          }}
        />
        <div style={{ fontSize: 12, color: COLORS.brick, marginBottom: 14, minHeight: 16 }}>{error}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <TicketButton variant="ghost" onClick={onCancel} style={{ flex: 1 }}>キャンセル</TicketButton>
          <TicketButton variant="primary" onClick={handleConfirm} style={{ flex: 1 }}>開く</TicketButton>
        </div>
      </div>
    </div>
  );
}

// パスワードリセット(全画面のパスワード設定を解除する)確認モーダル。
// キーワード一致のみで判定するローカル完結の仕組みのため、
// リセット用キーワード(SECURITY_RESET_KEYWORD)はクライアントコード上に平文で存在し、
// ブラウザの開発者ツール等から閲覧され得る(サーバー側検証がないため)。
function SecurityResetModal({ onCancel, onConfirm }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const ok = onConfirm(value);
    if (!ok) setError("キーワードが違います。");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,24,20,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 150,
        padding: 20,
      }}
    >
      <div style={{ background: COLORS.paper, borderRadius: 12, padding: 26, width: "100%", maxWidth: 360, boxShadow: "0 12px 40px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <AlertCircle size={20} color={COLORS.brick} />
          <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: COLORS.ink }}>パスワードをリセット</div>
        </div>
        <div style={{ fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 16 }}>
          すべてのパスワード設定を解除します。リセット用のキーワードを入力してください。
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
          autoFocus
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontFamily: MONO, fontSize: 15, color: COLORS.ink, marginBottom: 8 }}
        />
        <div style={{ fontSize: 12, color: COLORS.brick, marginBottom: 16, minHeight: 16 }}>{error}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <TicketButton variant="ghost" onClick={onCancel} style={{ flex: 1 }}>キャンセル</TicketButton>
          <TicketButton variant="danger" onClick={handleConfirm} style={{ flex: 1, background: COLORS.brick, color: "#FBF9F4" }}>
            リセットする
          </TicketButton>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   注文画面
--------------------------------------------------------- */
function OrderScreen({ seatNum, seatName, seat, products, now, onUpdateOrders, onBack, onGoCheckout, onCancelSeat }) {
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const [activeCat, setActiveCat] = useState(categories[0] || "");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const isNarrow = useMediaQuery("(max-width: 720px)");

  const addProduct = (p) => {
    const price = getEffectivePrice(p, new Date());
    const existing = seat.orders.find((o) => o.productId === p.id && o.price === price);
    let newOrders;
    if (existing) {
      newOrders = seat.orders.map((o) => (o.id === existing.id ? { ...o, qty: o.qty + 1 } : o));
    } else {
      newOrders = [...seat.orders, { id: uid("ord"), productId: p.id, name: p.name, price, qty: 1 }];
    }
    onUpdateOrders(newOrders);
  };

  const changeQty = (orderId, delta) => {
    let newOrders = seat.orders.map((o) => (o.id === orderId ? { ...o, qty: o.qty + delta } : o));
    newOrders = newOrders.filter((o) => o.qty > 0);
    onUpdateOrders(newOrders);
  };

  const total = seatOrderTotal(seat);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header
        title={companionLabel(seat.companion) ? `${seatDisplayLabel(seatNum, seatName)}　　担当：${companionLabel(seat.companion)}` : seatDisplayLabel(seatNum, seatName)}
        onBack={onBack}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 13 }}>
            <Users size={14} /> {seat.guests}名
            <Clock size={14} style={{ marginLeft: 4 }} /> {formatElapsed(seat.startTime, now)}
          </div>
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: isNarrow ? "column" : "row", overflow: isNarrow ? "auto" : "hidden" }}>
        {/* 商品一覧 */}
        <div
          style={{
            flex: isNarrow ? "none" : 1.3,
            display: "flex",
            flexDirection: "column",
            borderRight: isNarrow ? "none" : `1px dashed ${COLORS.line}`,
            borderBottom: isNarrow ? `1px dashed ${COLORS.line}` : "none",
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", gap: 6, padding: "10px 14px", overflowX: "auto", background: COLORS.paper, borderBottom: `1px solid ${COLORS.line}` }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  border: `1.5px solid ${activeCat === c ? COLORS.teal : COLORS.line}`,
                  background: activeCat === c ? COLORS.teal : "transparent",
                  color: activeCat === c ? "#FBF9F4" : COLORS.inkSoft,
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div style={{ flex: isNarrow ? "none" : 1, overflowY: isNarrow ? "visible" : "auto", padding: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))", gap: 10 }}>
              {products.filter((p) => p.category === activeCat).map((p) => {
                const nowDate = new Date(now);
                const active = p.timePrice && isTimeActive(p.timePrice, nowDate);
                const effectivePrice = active ? p.timePrice.price : p.price;
                return (
                  <button
                    key={p.id}
                    onClick={() => addProduct(p)}
                    disabled={p.soldOut}
                    style={{
                      background: p.soldOut ? COLORS.line : (active ? COLORS.amberBg : COLORS.paper),
                      border: `1.5px solid ${p.soldOut ? COLORS.line : (active ? COLORS.amber : COLORS.line)}`,
                      borderRadius: 8,
                      padding: "14px 10px",
                      textAlign: "left",
                      cursor: p.soldOut ? "not-allowed" : "pointer",
                      opacity: p.soldOut ? 0.55 : 1,
                    }}
                  >
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink, marginBottom: 6 }}>
                      {p.name}
                      {p.soldOut && <span style={{ fontFamily: MONO, fontWeight: 700 }}>(売り切れ)</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontFamily: MONO, fontSize: 13, color: active ? COLORS.amber : COLORS.teal, fontWeight: 700 }}>
                        {formatYen(effectivePrice)}
                      </span>
                      {active && (
                        <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.inkSoft, textDecoration: "line-through" }}>
                          {formatYen(p.price)}
                        </span>
                      )}
                    </div>
                    {p.timePrice && (
                      <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10.5, color: active ? COLORS.amber : COLORS.inkSoft, marginTop: 4 }}>
                        <Clock size={10} /> {p.timePrice.start}〜{p.timePrice.end}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 注文リスト */}
        <div style={{ flex: isNarrow ? "none" : 1, display: "flex", flexDirection: "column", minWidth: isNarrow ? 0 : 260 }}>
          <div style={{ padding: "12px 16px", fontSize: 12, fontFamily: MONO, color: COLORS.inkSoft, borderBottom: `1px solid ${COLORS.line}` }}>
            ORDER LIST
          </div>
          <div style={{ flex: isNarrow ? "none" : 1, overflowY: isNarrow ? "visible" : "auto", padding: "8px 16px" }}>
            {seat.orders.length === 0 && (
              <div style={{ color: COLORS.inkSoft, fontSize: 13, padding: "20px 0", textAlign: "center" }}>
                左のメニューから商品を選択してください
              </div>
            )}
            {seat.orders.map((o) => (
              <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px dashed ${COLORS.line}` }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: COLORS.inkSoft }}>{formatYen(o.price)} × {o.qty}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => changeQty(o.id, -1)} style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${COLORS.line}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Minus size={13} />
                  </button>
                  <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{o.qty}</span>
                  <button onClick={() => changeQty(o.id, 1)} style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${COLORS.line}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 16, borderTop: `1px solid ${COLORS.line}`, background: COLORS.paper }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: COLORS.inkSoft }}>小計</span>
              <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: COLORS.ink }}>{formatYen(total)}</span>
            </div>
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 12 }}>
              ※サービス料・消費税は会計時に加算されます
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <TicketButton
                variant="danger"
                onClick={() => setShowCancelConfirm(true)}
                style={{ flex: 1 }}
                icon={X}
              >
                取り消し
              </TicketButton>
              <TicketButton
                variant="primary"
                onClick={onGoCheckout}
                disabled={seat.orders.length === 0}
                style={{ flex: 2 }}
                icon={ReceiptText}
              >
                会計へ進む
              </TicketButton>
            </div>
          </div>
        </div>
      </div>

      {showCancelConfirm && (
        <ConfirmModal
          title="取り消しますか？"
          message={`座席${seatNum}の注文をすべて取り消し、空席に戻します。この操作は元に戻せません。`}
          confirmLabel="取り消す"
          onCancel={() => setShowCancelConfirm(false)}
          onConfirm={() => {
            setShowCancelConfirm(false);
            onCancelSeat(seatNum);
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   会計(料金詳細確認)画面
--------------------------------------------------------- */
function CheckoutScreen({ seatNum, seat, data, now, onBack, onConfirm }) {
  const bill = computeBill(seat, data);
  const { subtotal, serviceRate, serviceCharge, taxRate, tax, total } = bill;

  const [cash, setCash] = useState("");
  const [card, setCard] = useState("");
  const [paypay, setPaypay] = useState("");
  const [onAccount, setOnAccount] = useState("");
  const [memo, setMemo] = useState("");

  const cashN = Math.max(0, Number(cash) || 0);
  const cardN = Math.max(0, Number(card) || 0);
  const paypayN = Math.max(0, Number(paypay) || 0);
  const onAccountN = Math.max(0, Number(onAccount) || 0);
  const allocated = cashN + cardN + paypayN + onAccountN;
  const remaining = total - allocated;

  const setAll = (which) => {
    setCash(which === "cash" ? String(total) : "0");
    setCard(which === "card" ? String(total) : "0");
    setPaypay(which === "paypay" ? String(total) : "0");
    setOnAccount(which === "onAccount" ? String(total) : "0");
  };

  const canConfirm = allocated === total && total > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title={`会計 - ${seatDisplayLabel(seatNum, data.seatNames?.[seatNum])}`} onBack={onBack} />

      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 18, maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <div style={{ background: COLORS.paper, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.inkSoft, fontFamily: MONO, marginBottom: 10 }}>
            <span>{seat.guests}名 ・ 滞在 {formatElapsed(seat.startTime, now)}</span>
          </div>
          {seat.orders.map((o) => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13.5 }}>
              <span style={{ color: COLORS.ink }}>{o.name} <span style={{ color: COLORS.inkSoft }}>× {o.qty}</span></span>
              <span style={{ fontFamily: MONO, color: COLORS.ink }}>{formatYen(o.price * o.qty)}</span>
            </div>
          ))}

          <div style={{ borderTop: `1px dashed ${COLORS.line}`, marginTop: 10, paddingTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.inkSoft }}>
              <span>小計</span>
              <span style={{ fontFamily: MONO }}>{formatYen(subtotal)}</span>
            </div>
            {serviceRate > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.inkSoft }}>
                <span>サービス料（{formatPercent(serviceRate)}）</span>
                <span style={{ fontFamily: MONO }}>{formatYen(serviceCharge)}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.inkSoft }}>
                <span>消費税（{formatPercent(taxRate)}）</span>
                <span style={{ fontFamily: MONO }}>{formatYen(tax)}</span>
              </div>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, color: COLORS.ink }}>合計</span>
            <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: COLORS.teal }}>{formatYen(total)}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 10 }}>お支払い方法</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <TicketButton variant="subtle" onClick={() => setAll("cash")} style={{ fontSize: 12.5 }} icon={Banknote}>全額現金</TicketButton>
            <TicketButton variant="subtle" onClick={() => setAll("card")} style={{ fontSize: 12.5 }} icon={CreditCard}>全額クレジット</TicketButton>
            <TicketButton variant="subtle" onClick={() => setAll("paypay")} style={{ fontSize: 12.5 }} icon={Smartphone}>全額PayPay</TicketButton>
            <TicketButton variant="subtle" onClick={() => setAll("onAccount")} style={{ fontSize: 12.5 }} icon={FileText}>全額売掛</TicketButton>
          </div>

          {[
            { label: "現金", icon: Banknote, val: cash, set: setCash },
            { label: "クレジット", icon: CreditCard, val: card, set: setCard },
            { label: "PayPay", icon: Smartphone, val: paypay, set: setPaypay },
            { label: "売掛", icon: FileText, val: onAccount, set: setOnAccount },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, width: 96, color: COLORS.inkSoft, fontSize: 13, flexShrink: 0 }}>
                <row.icon size={15} /> {row.label}
              </div>
              <span style={{ fontFamily: MONO, color: COLORS.inkSoft }}>¥</span>
              <input
                type="number"
                min="0"
                value={row.val}
                onChange={(e) => row.set(e.target.value)}
                placeholder="0"
                style={{
                  flex: 1,
                  padding: "9px 10px",
                  borderRadius: 6,
                  border: `1.5px solid ${COLORS.line}`,
                  fontFamily: MONO,
                  fontSize: 15,
                  background: COLORS.paper,
                  color: COLORS.ink,
                }}
              />
            </div>
          ))}

          <div style={{ marginTop: 4, marginBottom: 4 }}>
            <label style={{ fontSize: 12, color: COLORS.inkSoft }}>メモ(任意)</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="伝票メモなど"
              rows={2}
              style={{
                width: "100%",
                padding: "9px 10px",
                borderRadius: 6,
                border: `1.5px solid ${COLORS.line}`,
                marginTop: 4,
                fontSize: 13.5,
                fontFamily: SANS,
                background: COLORS.paper,
                color: COLORS.ink,
                resize: "vertical",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 4px",
              fontSize: 13,
              fontFamily: MONO,
              color: remaining === 0 ? COLORS.sage : COLORS.brick,
              fontWeight: 700,
            }}
          >
            <span>{remaining === 0 ? "内訳が一致しています" : remaining > 0 ? "不足" : "超過"}</span>
            <span>{formatYen(Math.abs(remaining))}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: 16, borderTop: `1px solid ${COLORS.line}`, background: COLORS.paper }}>
        <TicketButton
          variant="primary"
          disabled={!canConfirm}
          onClick={() => onConfirm({ cash: cashN, card: cardN, paypay: paypayN, onAccount: onAccountN }, bill, memo.trim())}
          style={{ width: "100%", padding: "14px 18px" }}
          icon={Check}
        >
          会計を確定して座席を空ける
        </TicketButton>
      </div>
    </div>
  );
}

function SeatNameInput({ initialValue, onSave }) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => setValue(initialValue), [initialValue]);

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed !== (initialValue || "")) onSave(trimmed);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      placeholder="座席名(任意)"
      style={{
        width: "100%",
        padding: "7px 10px",
        borderRadius: 6,
        border: `1.5px solid ${COLORS.line}`,
        fontSize: 13,
        background: COLORS.paper,
        color: COLORS.ink,
      }}
    />
  );
}

function securitySegmentStyle(active) {
  return {
    flex: 1,
    padding: "9px 10px",
    borderRadius: 8,
    border: `1.5px solid ${active ? COLORS.teal : COLORS.line}`,
    background: active ? COLORS.teal : "transparent",
    color: active ? "#FBF9F4" : COLORS.inkSoft,
    fontSize: 12.5,
    fontWeight: 700,
    fontFamily: SANS,
    cursor: "pointer",
  };
}

const securityInputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1.5px solid ${COLORS.line}`,
  background: "#fff",
  fontFamily: MONO,
  fontSize: 14,
  color: COLORS.ink,
};

/* ---------------------------------------------------------
   パスワード設定パネル(マスタ設定内)
--------------------------------------------------------- */
function PasswordSettingsPanel({ security, onUpdateSecurity, onResetSecurity }) {
  const [pendingEnable, setPendingEnable] = useState({});
  const [mode, setMode] = useState(security.mode || "shared");
  const [lockMode, setLockMode] = useState(security.lockMode || "session");
  const [sharedPw, setSharedPw] = useState("");
  const [sharedPwConfirm, setSharedPwConfirm] = useState("");
  const [individualPw, setIndividualPw] = useState({ salesManagement: "", payroll: "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [removingKey, setRemovingKey] = useState(null);

  const pendingKeys = SECURITY_SCREEN_ORDER.filter((k) => pendingEnable[k]);
  const anyActive = SECURITY_SCREEN_ORDER.some((k) => security.enabled[k]) || pendingKeys.length > 0;

  const togglePending = (key) => {
    setPendingEnable((prev) => ({ ...prev, [key]: !prev[key] }));
    setError("");
    setSaved("");
  };

  const handleSave = () => {
    setError("");
    setSaved("");
    if (pendingKeys.length === 0) return;

    const newPasswords = { ...security.passwords };
    const newEnabled = { ...security.enabled };

    if (pendingKeys.length === 1 || mode === "shared") {
      if (!sharedPw.trim()) { setError("パスワードを入力してください。"); return; }
      if (sharedPw !== sharedPwConfirm) { setError("パスワード(確認)が一致しません。"); return; }
      pendingKeys.forEach((k) => { newPasswords[k] = encodePassword(sharedPw); newEnabled[k] = true; });
    } else {
      for (const k of pendingKeys) {
        if (!individualPw[k]?.trim()) { setError(`${SECURITY_SCREEN_LABELS[k]}のパスワードを入力してください。`); return; }
      }
      pendingKeys.forEach((k) => { newPasswords[k] = encodePassword(individualPw[k]); newEnabled[k] = true; });
    }

    onUpdateSecurity({ enabled: newEnabled, mode, lockMode, passwords: newPasswords });
    setPendingEnable({});
    setSharedPw("");
    setSharedPwConfirm("");
    setIndividualPw({ salesManagement: "", payroll: "" });
    setSaved("保存しました");
  };

  const handleRemoveSuccess = () => {
    const key = removingKey;
    onUpdateSecurity({
      enabled: { ...security.enabled, [key]: false },
      passwords: { ...security.passwords, [key]: "" },
    });
    setRemovingKey(null);
    setError("");
    setSaved(`${SECURITY_SCREEN_LABELS[key]}のパスワードを解除しました`);
  };

  const handleResetConfirm = (keyword) => {
    if (keyword !== SECURITY_RESET_KEYWORD) return false;
    onResetSecurity();
    setPendingEnable({});
    setSharedPw("");
    setSharedPwConfirm("");
    setIndividualPw({ salesManagement: "", payroll: "" });
    setError("");
    setSaved("パスワードをリセットしました");
    setShowResetModal(false);
    return true;
  };

  return (
    <div style={{ background: COLORS.paper, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: 20 }}>
      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 18, lineHeight: 1.6 }}>
        選んだ画面を開く際に、パスワード入力を必須にできます。設定はこの端末上でのみ有効です。
      </div>

      {SECURITY_SCREEN_ORDER.map((key) => {
        const isProtected = security.enabled[key];
        const isPending = pendingEnable[key];
        return (
          <div
            key={key}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink }}>{SECURITY_SCREEN_LABELS[key]}</div>
              {isProtected && <div style={{ fontSize: 11, color: COLORS.sage, marginTop: 2 }}>設定済み</div>}
            </div>
            {isProtected ? (
              <button
                onClick={() => setRemovingKey(key)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontFamily: SANS,
                  cursor: "pointer",
                  minWidth: 84,
                  border: `1.5px solid ${COLORS.brick}`,
                  background: "transparent",
                  color: COLORS.brick,
                }}
              >
                解除する
              </button>
            ) : (
              <button
                onClick={() => togglePending(key)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontFamily: SANS,
                  cursor: "pointer",
                  minWidth: 84,
                  border: isPending ? `1.5px solid ${COLORS.sage}` : `1.5px solid ${COLORS.line}`,
                  background: isPending ? COLORS.sageBg : "transparent",
                  color: isPending ? "#2c4a34" : COLORS.inkSoft,
                }}
              >
                設定する
              </button>
            )}
          </div>
        );
      })}

      {anyActive && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, margin: "20px 0 10px" }}>ロックのタイミング</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            <button onClick={() => setLockMode("session")} style={securitySegmentStyle(lockMode === "session")}>
              アプリ起動中は初回のみ
            </button>
            <button onClick={() => setLockMode("always")} style={securitySegmentStyle(lockMode === "always")}>
              タブを開くたび
            </button>
          </div>
        </>
      )}

      {pendingKeys.length >= 2 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 10 }}>パスワードの設定方法</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            <button onClick={() => setMode("shared")} style={securitySegmentStyle(mode === "shared")}>共通のパスワードにする</button>
            <button onClick={() => setMode("individual")} style={securitySegmentStyle(mode === "individual")}>画面ごとに個別に設定する</button>
          </div>
        </>
      )}

      {pendingKeys.length > 0 && (pendingKeys.length === 1 || mode === "shared") && (
        <>
          <div style={{ fontSize: 12, color: COLORS.inkSoft, fontWeight: 700, marginBottom: 6 }}>
            {pendingKeys.length === 1 ? `${SECURITY_SCREEN_LABELS[pendingKeys[0]]}のパスワード` : "共通パスワード"}
          </div>
          <input
            type="password"
            value={sharedPw}
            onChange={(e) => setSharedPw(e.target.value)}
            placeholder="4桁以上の数字など"
            style={securityInputStyle}
          />
          <div style={{ fontSize: 12, color: COLORS.inkSoft, fontWeight: 700, margin: "12px 0 6px" }}>確認のためもう一度入力</div>
          <input
            type="password"
            value={sharedPwConfirm}
            onChange={(e) => setSharedPwConfirm(e.target.value)}
            placeholder="もう一度入力"
            style={securityInputStyle}
          />
        </>
      )}

      {pendingKeys.length >= 2 && mode === "individual" && pendingKeys.map((key) => (
        <div key={key}>
          <div style={{ fontSize: 12, color: COLORS.inkSoft, fontWeight: 700, margin: "12px 0 6px" }}>{SECURITY_SCREEN_LABELS[key]}のパスワード</div>
          <input
            type="password"
            value={individualPw[key]}
            onChange={(e) => setIndividualPw((p) => ({ ...p, [key]: e.target.value }))}
            placeholder="4桁以上の数字など"
            style={securityInputStyle}
          />
        </div>
      ))}

      {error && <div style={{ fontSize: 12, color: COLORS.brick, marginTop: 12 }}>{error}</div>}
      {saved && <div style={{ fontSize: 12, color: COLORS.sage, marginTop: 12 }}>{saved}</div>}

      <TicketButton variant="primary" onClick={handleSave} disabled={pendingKeys.length === 0} style={{ width: "100%", marginTop: 20 }}>
        保存
      </TicketButton>

      <div style={{ height: 1, background: COLORS.line, margin: "24px 0" }} />

      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 8 }}>パスワードを忘れた場合</div>
      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 10, lineHeight: 1.6 }}>
        リセット用のキーワードを入力すると、すべてのパスワード設定を解除できます。
      </div>
      <TicketButton
        variant="danger"
        onClick={() => setShowResetModal(true)}
        style={{ width: "100%", background: "transparent" }}
      >
        パスワードをリセット
      </TicketButton>

      {showResetModal && (
        <SecurityResetModal onCancel={() => setShowResetModal(false)} onConfirm={handleResetConfirm} />
      )}

      {removingKey && (
        <PasswordPromptModal
          label={SECURITY_SCREEN_LABELS[removingKey]}
          stored={security.passwords[removingKey]}
          title="パスワードの解除"
          message={`「${SECURITY_SCREEN_LABELS[removingKey]}」の現在のパスワードを入力してください。`}
          onCancel={() => setRemovingKey(null)}
          onSuccess={handleRemoveSuccess}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   使用方法パネル(マスタ設定内)
--------------------------------------------------------- */
function GuideSection({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, marginBottom: 10, fontFamily: DISPLAY }}>{title}</div>
      {children}
    </div>
  );
}

function GuideItem({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.ink, marginBottom: 3 }}>・{label}</div>
      <div style={{ fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.7, paddingLeft: 14 }}>{children}</div>
    </div>
  );
}

function UserGuidePanel() {
  return (
    <div style={{ background: COLORS.paper, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          background: COLORS.brickBg,
          border: `1.5px solid ${COLORS.brick}`,
          borderRadius: 8,
          padding: "12px 14px",
          marginBottom: 18,
        }}
      >
        <AlertCircle size={16} color={COLORS.brick} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12.5, color: COLORS.brick, lineHeight: 1.7, fontWeight: 600 }}>
          ・このアプリを使用中はブラウザの「戻る」はクリックしないでください。
        </div>
      </div>

      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 24, lineHeight: 1.7 }}>
        このアプリの基本的な使い方をまとめています。データはこの端末内にのみ保存されるため、機種変更や故障に備えて「データ管理」から定期的にバックアップを書き出してください。
      </div>

      <GuideSection title="① 座席一覧">
        <GuideItem label="会計の流れ">
          座席カードをタップ→人数を選択(同伴のお客様の場合は「同伴」にチェック)して「開始する」→商品をタップして注文を追加→「会計へ進む」→お支払い方法(現金・カード・PayPay・売掛)を入力し「会計を確定して座席を空ける」で完了します。
        </GuideItem>
        <GuideItem label="同伴">
          人数入力時に「同伴」をチェックすると、担当するアルバイトを選択するリストが表示されます。選択すると座席カードに「使用中(担当者名)」、注文画面の見出しに「座席名　担当：担当者名」と表示され、会計後は売上履歴・日次集計の「同伴」列に担当者名が記録されます。
        </GuideItem>
        <GuideItem label="座席カードの色分け">
          使用中の座席カードは経過時間に応じて緑→黄→赤の順に色が変わります。切り替わりまでの時間はマスタ設定の「座席設定」で変更できます(初期値: 黄30分・赤60分)。
        </GuideItem>
        <GuideItem label="座席名">
          マスタ設定の「座席設定」で座席に名前を付けると、座席一覧・注文・会計・売上履歴の表示が座席名に置き換わります(未設定の座席は「座席1」のように番号表示になります)。
        </GuideItem>
      </GuideSection>

      <GuideSection title="② 売上管理">
        <GuideItem label="売上履歴">
          「本日のみ」「すべて」、または日付を指定して過去の会計記録を一覧表示できます。一覧上部に該当件数・合計金額を表示します。行をタップすると明細(注文内容)を確認できます。画面右上の「CSVダウンロード」で、表示中の絞り込み条件のままCSVファイルとして書き出せます。
        </GuideItem>
        <GuideItem label="入出金入力">
          日付ごとに、レジからの出金(仕入れなど)・入金(釣銭準備金など)を「摘要」「金額」で記録します。「+項目追加」で行を増やせます。
        </GuideItem>
        <GuideItem label="日次集計">
          指定した日の総売上(現金+カード+PayPay+売掛)・人件費(アルバイト管理の勤怠から自動計算)・出金/入金・残金(現金-人件費-出金+入金)をまとめて確認できます。その日の売上履歴・勤怠一覧(それぞれ件数・合計額つき)もあわせて表示されますが、編集はできません(編集は各専用画面で行ってください)。
        </GuideItem>
        <GuideItem label="集計グラフ">
          支払い方法(現金・カード・PayPay・売掛)別の売上を、日毎または月毎の積み上げグラフで確認できます。期間中の合計人数の推移も折れ線で重ねて表示されます。
        </GuideItem>
        <GuideItem label="PDFで保存(印刷)">
          日次集計画面の「PDFで保存(印刷)」を押すと印刷用の画面が別ウィンドウで開きます(売上履歴・勤怠一覧の件数・合計額も出力されます)。ブラウザの印刷ダイアログで「PDFに保存」を選ぶとPDFファイルとして保存できます。
        </GuideItem>
      </GuideSection>

      <GuideSection title="③ アルバイト管理">
        <GuideItem label="勤怠入力">
          従業員・日付・開始/終了時刻(15分単位)を入力して記録します。日給を入力した場合は、時給×時間の計算より日給が優先されます。同じ従業員・同じ日付ですでに登録されている時間帯と重なる場合は保存できません(エラーメッセージが表示されます)。
        </GuideItem>
        <GuideItem label="勤怠一覧">
          「個別」で従業員ごと、「全員一括」で全員分の勤怠記録を確認できます。「本日のみ」「すべて」、または日付を指定して絞り込めます。一覧上部に該当件数・合計金額を表示します。「CSVダウンロード」で表示中のデータを書き出せます。
        </GuideItem>
        <GuideItem label="集計">
          月次・年次で従業員ごとの給与を自動集計します。
        </GuideItem>
        <GuideItem label="アルバイトマスタ">
          従業員の氏名・時給を登録・編集・削除します。
        </GuideItem>
      </GuideSection>

      <GuideSection title="④ マスタ設定">
        <GuideItem label="商品管理">
          商品の名称・価格・カテゴリを登録します。時間帯によって価格を変える「時間帯価格」も設定できます。
        </GuideItem>
        <GuideItem label="座席設定">
          座席の追加・削除・名称の設定を行います。あわせて、座席カードの色分け(使用中の経過時間による色の切り替わり時間)も設定できます。
        </GuideItem>
        <GuideItem label="税・サービス料">
          サービス料率・消費税率を設定します。会計時は「小計→サービス料→消費税」の順で自動計算されます。
        </GuideItem>
        <GuideItem label="パスワード設定">
          売上管理・アルバイト管理の2画面それぞれにパスワードを設定できます(売上履歴は売上管理内のタブのため、売上管理のパスワードが適用されます)。両方に設定する場合は「共通のパスワード」か「画面ごとに個別」かを選べます。「ロックのタイミング」では、アプリ起動中は初回のみ確認するか、画面を開くたび毎回確認するかを選べます。パスワードを忘れた場合は、この画面下部の「パスワードをリセット」から専用のキーワードを入力するとすべての設定を解除できます。このリセット用キーワード、および「パスワード設定」タブ自体を開くためのパスワードは、アプリ制作者に確認してください。
        </GuideItem>
        <GuideItem label="データ管理">
          この端末での使用容量の確認、全データのJSONファイルへの書き出し(バックアップ)、書き出したJSONファイルからの復元、全データの削除ができます。書き出し・復元・削除はいずれもパスワードで保護されています(パスワードはアプリ制作者に確認してください)。アプリデータの容量が目安を超えると、この画面に注意・警告の表示が出ます。特に「全データ削除」はこの端末のすべてのデータを初期状態に戻す取り消せない操作のため、実行前に必ずバックアップを書き出してください。
        </GuideItem>
        <GuideItem label="バックアップの復元(全件復元/期間指定)">
          復元前に「全件復元」「期間指定」のどちらかを選びます。どちらも商品・座席・アルバイトマスタ・設定などは選択したファイルの内容にまるごと置き換わります(現在使用中の座席は復元対象外)。「全件復元」は売上履歴・勤怠・入出金もすべて選択したファイルの内容で復元しますが、「期間指定」はこの3つだけ、選択したファイルに含まれる直近1・3・6ヶ月のいずれかの期間分のみを復元します(容量が多くなってきた際に、事前にバックアップを書き出してから「全データ削除」→「期間指定」で復元すると、マスタは保ったまま直近データだけ残せます)。いずれもファイルを選択すると、実際に削除・復元される件数が確認画面に表示されるので、内容を確認してから実行してください。
        </GuideItem>
        <GuideItem label="アプリ更新">
          タブ行右上の「アプリ更新」ボタンを押すと、新しいバージョンが公開されていないか確認し、あれば自動的に読み込み直します(更新がない場合は「新しい更新はありません」と表示されます)。ホーム画面に追加した場合、通常はアプリを完全に終了してから開き直さないと更新が反映されませんが、このボタンでその手間を省けます。
        </GuideItem>
      </GuideSection>

      <GuideSection title="データの保存について">
        <div style={{ fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.7 }}>
          このアプリのデータはインターネット上のサーバーではなく、この端末(ブラウザ)内にのみ保存されます。ブラウザのデータを消去したり端末が故障したりするとデータが失われるため、「データ管理」の「全データをJSONで書き出す」を定期的に行い、バックアップファイルを安全な場所に保管することをおすすめします。
        </div>
      </GuideSection>

      <GuideSection title="オフラインでの利用">
        <div style={{ fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.7 }}>
          一度開いた端末では、インターネットに接続していなくても引き続き利用できます(接続が切れると画面上部に「オフラインで動作中です」と表示されます)。ホーム画面にアプリを追加しておくと、通常のアプリのように起動できて便利です。
        </div>
      </GuideSection>
    </div>
  );
}

/* ---------------------------------------------------------
   マスタ設定画面
--------------------------------------------------------- */
function SettingsScreen({ data, onBack, onUpdateProducts, onUpdateSeatCount, onUpdateSeatName, onUpdateRates, onUpdateSeatToneThresholds, onImportData, onImportDataPeriod, onDeleteAllData, onUpdateSecurity, onResetSecurity, showToast }) {
  const isNarrow = useMediaQuery("(max-width: 720px)");
  const [tab, setTab] = useState("products");
  const [editing, setEditing] = useState(null); // product being edited, or {} for new
  const [serviceInput, setServiceInput] = useState(String(data.serviceChargeRate ?? 0));
  const [taxInput, setTaxInput] = useState(String(data.taxRate ?? 0));
  const [warnInput, setWarnInput] = useState(String(data.seatToneThresholds?.warnMinutes ?? 30));
  const [dangerInput, setDangerInput] = useState(String(data.seatToneThresholds?.dangerMinutes ?? 60));
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [importError, setImportError] = useState("");
  const [importOk, setImportOk] = useState("");
  const [storageEstimate, setStorageEstimate] = useState(null);
  const [passwordTabUnlocked, setPasswordTabUnlocked] = useState(false);
  const [pendingPasswordTab, setPendingPasswordTab] = useState(false);
  const [pendingExport, setPendingExport] = useState(false);
  const [pendingDeleteAllPassword, setPendingDeleteAllPassword] = useState(false);
  const [pendingDeleteAllConfirm, setPendingDeleteAllConfirm] = useState(false);
  const [pendingRestorePassword, setPendingRestorePassword] = useState(false);
  const [restoreFileName, setRestoreFileName] = useState("");
  const [restoreMode, setRestoreMode] = useState("full"); // "full" | "period"
  const [restoreMonths, setRestoreMonths] = useState(1); // 1 | 3 | 6
  const [pendingRestoreConfirm, setPendingRestoreConfirm] = useState(null); // 復元確認モーダル用の情報
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(setStorageEstimate).catch(() => {});
    }
  }, []);

  const handleTabClick = (id) => {
    if (id === "password" && !passwordTabUnlocked) {
      setPendingPasswordTab(true);
      return;
    }
    setTab(id);
  };

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      appVersion: "pos-app-v1",
      data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `pos-backup_${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreFileName(file.name);
    setImportError("");
    setImportOk("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const restored = parsed && parsed.data ? parsed.data : parsed; // 生データJSONも許容
        if (!restored || typeof restored !== "object" || !Array.isArray(restored.products)) {
          throw new Error("invalid");
        }
        // パスワードはMIRIN接頭辞を付けて保存する仕様のため、復元時に一度剥がしてから
        // 付け直し、接頭辞のない古い形式のバックアップが来ても不整合にならないようにする
        if (restored.security && restored.security.passwords) {
          const normalized = {};
          Object.entries(restored.security.passwords).forEach(([k, v]) => {
            normalized[k] = v ? encodePassword(decodePassword(v)) : "";
          });
          restored.security = { ...restored.security, passwords: normalized };
        }
        if (restoreMode === "period") {
          const filtered = filterRestoreDataByMonths(restored, restoreMonths);
          setPendingRestoreConfirm({ mode: "period", restored, filtered, months: restoreMonths });
        } else {
          setPendingRestoreConfirm({ mode: "full", restored });
        }
      } catch (err) {
        setImportError("ファイルを読み込めませんでした。バックアップ用のJSONファイルを選択してください。");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const saveProduct = (p) => {
    let list;
    if (p.id) {
      list = data.products.map((x) => (x.id === p.id ? p : x));
    } else {
      list = [...data.products, { ...p, id: uid("p") }];
    }
    onUpdateProducts(list);
    setEditing(null);
  };

  const deleteProduct = (id) => {
    onUpdateProducts(data.products.filter((p) => p.id !== id));
  };

  const toggleSoldOut = (id) => {
    onUpdateProducts(data.products.map((p) => (p.id === id ? { ...p, soldOut: !p.soldOut } : p)));
  };

  const addSeat = () => {
    onUpdateSeatCount(Math.min(200, data.seatCount + 1));
  };

  const removeLastSeat = () => {
    if (data.seats[data.seatCount]) return; // 使用中は削除不可
    onUpdateSeatCount(Math.max(1, data.seatCount - 1));
  };

  const applyRates = () => {
    const service = Math.max(0, Math.min(100, Number(serviceInput) || 0));
    const tax = Math.max(0, Math.min(100, Number(taxInput) || 0));
    setServiceInput(String(service));
    setTaxInput(String(tax));
    onUpdateRates(service, tax);
    showToast("保存しました");
  };

  const applySeatToneThresholds = () => {
    const warn = Math.max(1, Math.round(Number(warnInput) || 1));
    let danger = Math.max(1, Math.round(Number(dangerInput) || 1));
    if (danger <= warn) danger = warn + 1;
    setWarnInput(String(warn));
    setDangerInput(String(danger));
    onUpdateSeatToneThresholds(warn, danger);
    showToast("保存しました");
  };

  // 新しいService Workerの取得を明示的にチェックし、実際に有効化されて
  // ページの制御を引き継いだ(=更新があった)ことを検知したら「更新しました」を
  // 表示してからリロードする。一定時間待っても引き継ぎが起きなければ
  // 「新しい更新はありません」を表示するのみでリロードはしない。
  const handleAppUpdate = () => {
    if (!("serviceWorker" in navigator)) {
      showToast("新しい更新はありません");
      return;
    }
    setCheckingUpdate(true);
    let done = false;
    const onUpdated = () => {
      if (done) return;
      done = true;
      setCheckingUpdate(false);
      showToast("更新しました");
      setTimeout(() => window.location.reload(), 1200);
    };
    navigator.serviceWorker.addEventListener("controllerchange", onUpdated, { once: true });
    navigator.serviceWorker.getRegistration()
      .then((reg) => reg && reg.update())
      .catch(() => {})
      .finally(() => {
        setTimeout(() => {
          if (done) return;
          done = true;
          navigator.serviceWorker.removeEventListener("controllerchange", onUpdated);
          setCheckingUpdate(false);
          showToast("新しい更新はありません");
        }, 8000);
      });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="マスタ設定" onBack={onBack} />

      <div style={{ display: "flex", gap: 6, padding: "12px 20px", borderBottom: `1px solid ${COLORS.line}`, background: COLORS.paper, overflowX: "auto" }}>
        {[{ id: "products", label: "商品管理" }, { id: "seats", label: "座席設定" }, { id: "rates", label: "税・サービス料" }, { id: "password", label: "パスワード設定" }, { id: "data", label: "データ管理" }, { id: "help", label: "使用方法" }].map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabClick(t.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: `1.5px solid ${tab === t.id ? COLORS.teal : COLORS.line}`,
              background: tab === t.id ? COLORS.teal : "transparent",
              color: tab === t.id ? "#FBF9F4" : COLORS.inkSoft,
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: "nowrap",
              flexShrink: 0,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", flexShrink: 0, alignSelf: "center", display: "flex", alignItems: "center", gap: 10, paddingLeft: 12 }}>
          <div style={{ fontSize: 11, fontFamily: MONO, color: COLORS.inkSoft, whiteSpace: "nowrap" }}>
            最終更新: {APP_LAST_UPDATED}
          </div>
          <button
            onClick={handleAppUpdate}
            disabled={checkingUpdate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 10px",
              borderRadius: 14,
              border: `1.5px solid ${COLORS.line}`,
              background: "transparent",
              color: COLORS.inkSoft,
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: "nowrap",
              cursor: checkingUpdate ? "default" : "pointer",
              opacity: checkingUpdate ? 0.6 : 1,
            }}
          >
            <RefreshCw size={11} />
            {checkingUpdate ? "更新確認中…" : "アプリ更新"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20, maxWidth: tab === "seats" ? "none" : 560, margin: "0 auto", width: "100%" }}>
        {tab === "products" && (
          <>
            <TicketButton variant="primary" onClick={() => setEditing({})} icon={Plus} style={{ marginBottom: 16 }}>
              商品を追加
            </TicketButton>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.products.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: COLORS.paper,
                    border: `1.5px solid ${COLORS.line}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                  }}
                >
                  <div style={{ opacity: p.soldOut ? 0.5 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{p.name}</div>
                      {p.soldOut && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.brick, border: `1px solid ${COLORS.brick}`, borderRadius: 4, padding: "1px 5px" }}>
                          売り切れ
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.inkSoft, fontFamily: MONO }}>{p.category} ・ {formatYen(p.price)}</div>
                    {p.timePrice && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: COLORS.amber, fontFamily: MONO, marginTop: 3 }}>
                        <Clock size={11} /> {p.timePrice.start}〜{p.timePrice.end} {formatYen(p.timePrice.price)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => toggleSoldOut(p.id)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        border: `1px solid ${p.soldOut ? COLORS.amber : COLORS.line}`,
                        background: p.soldOut ? COLORS.amber : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: p.soldOut ? "#FBF9F4" : COLORS.inkSoft,
                      }}
                      title="売り切れ"
                    >
                      <Ban size={14} />
                    </button>
                    <button onClick={() => setEditing(p)} style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${COLORS.line}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteProduct(p.id)} style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${COLORS.brick}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.brick }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "seats" && (
          <div style={{ display: "flex", flexDirection: isNarrow ? "column" : "row", gap: 20 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <TicketButton variant="primary" onClick={addSeat} icon={Plus} disabled={data.seatCount >= 200} style={{ marginBottom: 16 }}>
                座席を追加
              </TicketButton>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Array.from({ length: data.seatCount }, (_, i) => i + 1).map((n) => {
                  const occupied = !!data.seats[n];
                  const isLast = n === data.seatCount;
                  return (
                    <div
                      key={n}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        background: COLORS.paper,
                        border: `1.5px solid ${COLORS.line}`,
                        borderRadius: 8,
                        padding: "10px 14px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>座席 {n}</div>
                          {occupied && (
                            <div style={{ fontSize: 12, color: COLORS.brick, fontFamily: MONO }}>使用中</div>
                          )}
                        </div>
                        {isLast && (
                          <button
                            onClick={removeLastSeat}
                            disabled={occupied || data.seatCount <= 1}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              border: `1px solid ${COLORS.brick}`,
                              background: "transparent",
                              cursor: occupied || data.seatCount <= 1 ? "not-allowed" : "pointer",
                              opacity: occupied || data.seatCount <= 1 ? 0.4 : 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: COLORS.brick,
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <SeatNameInput
                        seatNum={n}
                        initialValue={data.seatNames?.[n] || ""}
                        onSave={(name) => onUpdateSeatName(n, name)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {!isNarrow && (
                <div style={{ visibility: "hidden", marginBottom: 16 }} aria-hidden="true">
                  <TicketButton variant="primary" icon={Plus} style={{ pointerEvents: "none" }}>座席を追加</TicketButton>
                </div>
              )}
              <div style={{ background: COLORS.paper, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 13, color: COLORS.ink, fontWeight: 700, marginBottom: 8 }}>座席カードの色分け</div>
                <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 18, lineHeight: 1.6 }}>
                  座席一覧で使用中の座席カードは、経過時間に応じて色が変わります。切り替わりまでの時間を分単位で設定してください。
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: COLORS.ink, fontWeight: 600, marginBottom: 8 }}>
                    <Clock size={14} /> 黄色に変わるまでの時間
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="number"
                      value={warnInput}
                      onChange={(e) => setWarnInput(e.target.value)}
                      style={{ flex: 1, padding: "10px 12px", borderRadius: 6, border: `1.5px solid ${COLORS.line}`, fontFamily: MONO, fontSize: 16 }}
                    />
                    <span style={{ fontFamily: MONO, color: COLORS.inkSoft }}>分</span>
                  </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: COLORS.ink, fontWeight: 600, marginBottom: 8 }}>
                    <Clock size={14} /> 赤色に変わるまでの時間
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="number"
                      value={dangerInput}
                      onChange={(e) => setDangerInput(e.target.value)}
                      style={{ flex: 1, padding: "10px 12px", borderRadius: 6, border: `1.5px solid ${COLORS.line}`, fontFamily: MONO, fontSize: 16 }}
                    />
                    <span style={{ fontFamily: MONO, color: COLORS.inkSoft }}>分</span>
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 6 }}>
                    ※赤色の時間は黄色の時間より後に設定してください(短い場合は自動的に調整されます)
                  </div>
                </div>

                <TicketButton variant="primary" onClick={applySeatToneThresholds} style={{ width: "100%" }}>保存</TicketButton>
              </div>
            </div>
          </div>
        )}

        {tab === "rates" && (
          <div style={{ background: COLORS.paper, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 18, lineHeight: 1.6 }}>
              会計時に「小計 → サービス料 → 消費税」の順で自動計算されます。
              サービス料が不要な場合は0を設定してください。
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: COLORS.ink, fontWeight: 600, marginBottom: 8 }}>
                <Percent size={14} /> サービス料率
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="number"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 6, border: `1.5px solid ${COLORS.line}`, fontFamily: MONO, fontSize: 16 }}
                />
                <span style={{ fontFamily: MONO, color: COLORS.inkSoft }}>%</span>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: COLORS.ink, fontWeight: 600, marginBottom: 8 }}>
                <Percent size={14} /> 消費税率
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="number"
                  value={taxInput}
                  onChange={(e) => setTaxInput(e.target.value)}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 6, border: `1.5px solid ${COLORS.line}`, fontFamily: MONO, fontSize: 16 }}
                />
                <span style={{ fontFamily: MONO, color: COLORS.inkSoft }}>%</span>
              </div>
              <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 6 }}>
                ※消費税はサービス料込みの金額に対して計算されます
              </div>
            </div>

            <TicketButton variant="primary" onClick={applyRates} style={{ width: "100%" }}>保存</TicketButton>
          </div>
        )}

        {tab === "password" && (
          <PasswordSettingsPanel
            security={data.security}
            onUpdateSecurity={onUpdateSecurity}
            onResetSecurity={onResetSecurity}
          />
        )}

        {tab === "data" && (
          <div style={{ background: COLORS.paper, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 20, lineHeight: 1.6 }}>
              このアプリのデータはこの端末内(ローカル)にのみ保存されています。
              端末の故障やブラウザデータの消去に備えて、定期的にバックアップの書き出しをおすすめします。
            </div>

            {storageEstimate && storageEstimate.quota > 0 && (() => {
              const rawData = localStorage.getItem(STORAGE_KEY);
              const appDataBytes = rawData ? new Blob([rawData]).size : 0;
              return (
                <div style={{ marginBottom: 24, padding: 14, background: COLORS.sageBg, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: COLORS.ink, fontWeight: 700, marginBottom: 10 }}>この端末での使用容量</div>

                  <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginBottom: 4 }}>ブラウザでの使用量(全体)</div>
                  <div style={{ fontSize: 14, fontFamily: MONO, color: COLORS.ink, fontWeight: 700 }}>
                    {formatBytes(storageEstimate.usage)} <span style={{ fontWeight: 400, color: COLORS.inkSoft }}>/ {formatBytes(storageEstimate.quota)}</span>
                  </div>
                  <div style={{ height: 6, background: COLORS.paper, borderRadius: 3, marginTop: 8, marginBottom: 12, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, (storageEstimate.usage / storageEstimate.quota) * 100)}%`,
                        background: COLORS.teal,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      paddingTop: 10,
                      borderTop: `1px dashed ${COLORS.line}`,
                    }}
                  >
                    <span style={{ fontSize: 11.5, color: COLORS.inkSoft }}>うちアプリデータ本体(商品・座席・売上等)</span>
                    <span style={{ fontSize: 14, fontFamily: MONO, color: COLORS.ink, fontWeight: 700 }}>{formatBytes(appDataBytes)}</span>
                  </div>

                  <div style={{ fontSize: 10.5, color: COLORS.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
                    ※「ブラウザでの使用量」はReact本体等のオフラインキャッシュも含むこのアプリ全体の使用量、「アプリデータ本体」はバックアップに書き出される実データのみのサイズです。
                  </div>

                  {appDataBytes >= APP_DATA_DANGER_BYTES && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 12, padding: "8px 10px", background: COLORS.brickBg, borderRadius: 6 }}>
                      <AlertCircle size={14} color={COLORS.brick} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 11.5, color: COLORS.brick, fontWeight: 700, lineHeight: 1.5 }}>
                        アプリデータの容量が多くなっています。バックアップを書き出したうえで、古い売上履歴・勤怠・入出金データの整理をおすすめします。
                      </span>
                    </div>
                  )}
                  {appDataBytes >= APP_DATA_WARN_BYTES && appDataBytes < APP_DATA_DANGER_BYTES && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 12, padding: "8px 10px", background: COLORS.amberBg, borderRadius: 6 }}>
                      <AlertCircle size={14} color={COLORS.amber} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 11.5, color: COLORS.amber, fontWeight: 700, lineHeight: 1.5 }}>
                        アプリデータの容量がやや多くなってきています。念のためバックアップの書き出しをおすすめします。
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: COLORS.ink, fontWeight: 700, marginBottom: 8 }}>バックアップの書き出し</div>
              <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 10 }}>
                商品・座席・売上履歴・設定をすべて含むJSONファイルをダウンロードします。
              </div>
              <TicketButton variant="primary" onClick={() => setPendingExport(true)} style={{ width: "100%" }}>
                全データをJSONで書き出す
              </TicketButton>
            </div>

            <div style={{ height: 1, background: COLORS.line, margin: "20px 0" }} />

            <div>
              <div style={{ fontSize: 13, color: COLORS.ink, fontWeight: 700, marginBottom: 8 }}>バックアップの復元</div>
              <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 10, lineHeight: 1.6 }}>
                「全件復元」は現在のすべてのデータを削除し、選択したファイルの内容にまるごと置き換えます。
                「期間指定」も商品・座席・設定などのマスタは選択したファイルの内容に置き換わりますが、売上履歴・勤怠・入出金だけは直近の期間(1・3・6ヶ月)分のみを復元します(容量を空けたいときにおすすめです)。いずれも取り消せません。
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <button onClick={() => setRestoreMode("full")} style={salesTabPillStyle(restoreMode === "full")}>全件復元</button>
                <button onClick={() => setRestoreMode("period")} style={salesTabPillStyle(restoreMode === "period")}>期間指定</button>
              </div>
              {restoreMode === "period" && (
                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                  {[1, 3, 6].map((m) => (
                    <button key={m} onClick={() => setRestoreMonths(m)} style={salesTabPillStyle(restoreMonths === m)}>直近{m}ヶ月</button>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportFile}
                style={{ display: "none" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <TicketButton variant="ghost" onClick={() => setPendingRestorePassword(true)} style={{ padding: "8px 16px" }}>
                  ファイルを選択
                </TicketButton>
                <span style={{ fontSize: 12.5, color: COLORS.inkSoft }}>{restoreFileName || "選択されていません"}</span>
              </div>
              {importError && (
                <div style={{ fontSize: 12, color: COLORS.brick, marginTop: 8 }}>{importError}</div>
              )}
              {importOk && (
                <div style={{ fontSize: 12, color: COLORS.sage, marginTop: 8 }}>{importOk}</div>
              )}
            </div>

            <div style={{ height: 1, background: COLORS.line, margin: "20px 0" }} />

            <div>
              <div style={{ fontSize: 13, color: COLORS.brick, fontWeight: 700, marginBottom: 8 }}>全データ削除</div>
              <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 10, lineHeight: 1.6 }}>
                この端末に保存されている商品・座席・売上履歴・設定などすべてのデータを削除し、初期状態に戻します。この操作は取り消せません。事前にバックアップの書き出しをおすすめします。
              </div>
              <TicketButton variant="danger" onClick={() => setPendingDeleteAllPassword(true)} style={{ width: "100%", background: COLORS.brick, color: "#FBF9F4" }}>
                全データ削除
              </TicketButton>
            </div>
          </div>
        )}

        {tab === "help" && <UserGuidePanel />}
      </div>

      {editing !== null && (
        <ProductEditModal
          product={editing}
          categories={Array.from(new Set(data.products.map((p) => p.category)))}
          onCancel={() => setEditing(null)}
          onSave={saveProduct}
        />
      )}

      {pendingPasswordTab && (
        <PasswordPromptModal
          label="パスワード設定"
          stored={encodePassword(SETTINGS_ADMIN_PASSWORD)}
          onCancel={() => setPendingPasswordTab(false)}
          onSuccess={() => { setPasswordTabUnlocked(true); setPendingPasswordTab(false); setTab("password"); }}
        />
      )}

      {pendingExport && (
        <PasswordPromptModal
          label="全データをJSONで書き出す"
          stored={encodePassword(SETTINGS_ADMIN_PASSWORD)}
          onCancel={() => setPendingExport(false)}
          onSuccess={() => { setPendingExport(false); exportData(); }}
        />
      )}

      {pendingRestorePassword && (
        <PasswordPromptModal
          label="バックアップの復元"
          message="「バックアップの復元」を行うにはパスワードを入力してください。"
          stored={encodePassword(SETTINGS_ADMIN_PASSWORD)}
          onCancel={() => setPendingRestorePassword(false)}
          onSuccess={() => { setPendingRestorePassword(false); fileInputRef.current?.click(); }}
        />
      )}

      {pendingRestoreConfirm && pendingRestoreConfirm.mode === "full" && (
        <ConfirmModal
          title="全件復元"
          message="現在この端末にある商品・座席・売上履歴・設定などすべてのデータを削除し、選択したファイルの内容で復元します。この操作は取り消せません。よろしいですか?"
          confirmLabel="復元する"
          onCancel={() => setPendingRestoreConfirm(null)}
          onConfirm={() => {
            onImportData(pendingRestoreConfirm.restored);
            setPendingRestoreConfirm(null);
            setImportOk("データを復元しました");
            showToast("データを復元しました");
          }}
        />
      )}

      {pendingRestoreConfirm && pendingRestoreConfirm.mode === "period" && (
        <ConfirmModal
          title="期間指定で復元"
          message={
            <>
              現在この端末にある商品・座席・設定などのマスタ、および売上履歴・勤怠・入出金をすべて削除し、選択したファイルの内容で復元します(現在使用中の座席は復元対象外です)。ただし売上履歴・勤怠・入出金は、直近{pendingRestoreConfirm.months}ヶ月分のみを復元します。この操作は取り消せません。
              <br /><br />
              復元されるデータ件数
              <br />
              ・売上履歴: {pendingRestoreConfirm.filtered.salesHistory.length}件
              <br />
              ・勤怠: {pendingRestoreConfirm.filtered.shifts.length}件
              <br />
              ・入出金: {Object.keys(pendingRestoreConfirm.filtered.cashFlowRecords).length}日分
              <br /><br />
              よろしいですか?
            </>
          }
          confirmLabel="復元する"
          onCancel={() => setPendingRestoreConfirm(null)}
          onConfirm={() => {
            const { restored, filtered, months } = pendingRestoreConfirm;
            onImportDataPeriod(restored, filtered);
            setPendingRestoreConfirm(null);
            const msg = `直近${months}ヶ月分(売上履歴${filtered.salesHistory.length}件・勤怠${filtered.shifts.length}件・入出金${Object.keys(filtered.cashFlowRecords).length}日分)を復元しました`;
            setImportOk(msg);
            showToast(msg);
          }}
        />
      )}

      {pendingDeleteAllPassword && (
        <PasswordPromptModal
          label="全データ削除"
          message="「全データ削除」を行うにはパスワードを入力してください。"
          stored={encodePassword(SETTINGS_ADMIN_PASSWORD)}
          onCancel={() => setPendingDeleteAllPassword(false)}
          onSuccess={() => { setPendingDeleteAllPassword(false); setPendingDeleteAllConfirm(true); }}
        />
      )}

      {pendingDeleteAllConfirm && (
        <ConfirmModal
          title="全データ削除"
          message="すべてのデータを削除します。本当に削除しますか？"
          confirmLabel="削除する"
          onCancel={() => setPendingDeleteAllConfirm(false)}
          onConfirm={() => {
            setPendingDeleteAllConfirm(false);
            onDeleteAllData();
            showToast("全データを削除しました");
          }}
        />
      )}
    </div>
  );
}

function ProductEditModal({ product, categories, onCancel, onSave }) {
  const [name, setName] = useState(product.name || "");
  const [price, setPrice] = useState(product.price != null ? String(product.price) : "");
  const [category, setCategory] = useState(product.category || categories[0] || "フード");
  const [customCat, setCustomCat] = useState(false);

  const existingTP = product.timePrice || null;
  const [tpEnabled, setTpEnabled] = useState(!!existingTP);
  const [tpStart, setTpStart] = useState(existingTP?.start || "21:00");
  const [tpEnd, setTpEnd] = useState(existingTP?.end || "02:00");
  const [tpPrice, setTpPrice] = useState(existingTP?.price != null ? String(existingTP.price) : "");

  const valid =
    name.trim().length > 0 &&
    Number(price) > 0 &&
    category.trim().length > 0 &&
    (!tpEnabled || (tpStart && tpEnd && Number(tpPrice) > 0));

  const handleSave = () => {
    onSave({
      ...product,
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
      timePrice: tpEnabled ? { start: tpStart, end: tpEnd, price: Number(tpPrice) } : null,
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,24,20,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20, overflowY: "auto" }}>
      <div style={{ background: COLORS.paper, borderRadius: 12, padding: 24, width: "100%", maxWidth: 380, boxShadow: "0 12px 40px rgba(0,0,0,0.25)", margin: "20px 0" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, marginBottom: 18, color: COLORS.ink }}>
          {product.id ? "商品を編集" : "商品を追加"}
        </div>

        <label style={{ fontSize: 12, color: COLORS.inkSoft }}>商品名</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: `1.5px solid ${COLORS.line}`, marginTop: 4, marginBottom: 14, fontSize: 14 }} />

        <label style={{ fontSize: 12, color: COLORS.inkSoft }}>通常価格</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: `1.5px solid ${COLORS.line}`, marginTop: 4, marginBottom: 14, fontFamily: MONO, fontSize: 14 }} />

        <label style={{ fontSize: 12, color: COLORS.inkSoft }}>カテゴリ</label>
        {!customCat ? (
          <div style={{ display: "flex", gap: 6, marginTop: 4, marginBottom: 14, flexWrap: "wrap" }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{ padding: "6px 12px", borderRadius: 16, border: `1.5px solid ${category === c ? COLORS.teal : COLORS.line}`, background: category === c ? COLORS.teal : "transparent", color: category === c ? "#FBF9F4" : COLORS.ink, fontSize: 12.5, cursor: "pointer" }}
              >
                {c}
              </button>
            ))}
            <button onClick={() => { setCustomCat(true); setCategory(""); }} style={{ padding: "6px 12px", borderRadius: 16, border: `1.5px dashed ${COLORS.line}`, background: "transparent", color: COLORS.inkSoft, fontSize: 12.5, cursor: "pointer" }}>
              + 新規
            </button>
          </div>
        ) : (
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="新しいカテゴリ名" style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: `1.5px solid ${COLORS.line}`, marginTop: 4, marginBottom: 14, fontSize: 14 }} />
        )}

        <div style={{ borderTop: `1px dashed ${COLORS.line}`, marginTop: 4, paddingTop: 14, marginBottom: 4 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={tpEnabled} onChange={(e) => setTpEnabled(e.target.checked)} style={{ width: 16, height: 16 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={14} /> 時間帯価格を設定する
            </span>
          </label>

          {tpEnabled && (
            <div style={{ marginTop: 12, paddingLeft: 2 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: COLORS.inkSoft }}>開始</label>
                  <input type="time" value={tpStart} onChange={(e) => setTpStart(e.target.value)} style={{ width: "100%", padding: "8px 8px", borderRadius: 6, border: `1.5px solid ${COLORS.line}`, marginTop: 3, fontFamily: MONO, fontSize: 13 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: COLORS.inkSoft }}>終了</label>
                  <input type="time" value={tpEnd} onChange={(e) => setTpEnd(e.target.value)} style={{ width: "100%", padding: "8px 8px", borderRadius: 6, border: `1.5px solid ${COLORS.line}`, marginTop: 3, fontFamily: MONO, fontSize: 13 }} />
                </div>
              </div>
              <label style={{ fontSize: 11, color: COLORS.inkSoft }}>時間帯価格</label>
              <input type="number" value={tpPrice} onChange={(e) => setTpPrice(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: `1.5px solid ${COLORS.line}`, marginTop: 3, marginBottom: 8, fontFamily: MONO, fontSize: 14 }} />
              {tpStart > tpEnd && (
                <div style={{ fontSize: 11, color: COLORS.inkSoft }}>
                  日をまたぐ時間帯として扱われます（{tpStart}〜翌{tpEnd}）
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <TicketButton variant="ghost" onClick={onCancel} style={{ flex: 1 }}>キャンセル</TicketButton>
          <TicketButton variant="primary" disabled={!valid} onClick={handleSave} style={{ flex: 1 }}>
            保存
          </TicketButton>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   売上履歴 - 明細画面
--------------------------------------------------------- */
function HistoryDetailScreen({ sale, onBack }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title={`会計明細 - ${seatDisplayLabel(sale.seatId, sale.seatName)}`} onBack={onBack} />

      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 18, maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <div style={{ background: COLORS.paper, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: COLORS.inkSoft, fontFamily: MONO, marginBottom: 10 }}>
            <span>{sale.guests}名</span>
            <span>入店 {formatDateTimeShort(sale.startTime)} 〜 会計 {formatDateTimeShort(sale.endTime)}</span>
          </div>

          {sale.orders.map((o) => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13.5 }}>
              <span style={{ color: COLORS.ink }}>{o.name} <span style={{ color: COLORS.inkSoft }}>× {o.qty}</span></span>
              <span style={{ fontFamily: MONO, color: COLORS.ink }}>{formatYen(o.price * o.qty)}</span>
            </div>
          ))}

          <div style={{ borderTop: `1px dashed ${COLORS.line}`, marginTop: 10, paddingTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.inkSoft }}>
              <span>小計</span>
              <span style={{ fontFamily: MONO }}>{formatYen(sale.subtotal ?? sale.total)}</span>
            </div>
            {(sale.serviceCharge ?? 0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.inkSoft }}>
                <span>サービス料（{formatPercent(sale.serviceRate)}）</span>
                <span style={{ fontFamily: MONO }}>{formatYen(sale.serviceCharge)}</span>
              </div>
            )}
            {(sale.tax ?? 0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.inkSoft }}>
                <span>消費税（{formatPercent(sale.taxRate)}）</span>
                <span style={{ fontFamily: MONO }}>{formatYen(sale.tax)}</span>
              </div>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, color: COLORS.ink }}>合計</span>
            <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: COLORS.teal }}>{formatYen(sale.total)}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 10 }}>お支払い内訳</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "現金", icon: Banknote, key: "cash" },
              { label: "クレジット", icon: CreditCard, key: "card" },
              { label: "PayPay", icon: Smartphone, key: "paypay" },
              { label: "売掛", icon: FileText, key: "onAccount" },
            ].filter((row) => (sale.payments?.[row.key] ?? 0) > 0).map((row) => (
              <div key={row.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.inkSoft, fontSize: 13 }}>
                  <row.icon size={15} /> {row.label}
                </div>
                <span style={{ fontFamily: MONO, fontWeight: 700, color: COLORS.ink }}>{formatYen(sale.payments[row.key])}</span>
              </div>
            ))}
            {(!sale.payments || Object.values(sale.payments).every((v) => !v)) && (
              <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>支払い情報がありません</div>
            )}
          </div>
        </div>

        {sale.memo && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 10 }}>メモ</div>
            <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: COLORS.ink, whiteSpace: "pre-wrap" }}>
              {sale.memo}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ルートアプリ
--------------------------------------------------------- */
function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("top"); // top | order | checkout | settings | historyDetail | salesManagement | payroll
  const [homeTab, setHomeTab] = useState("seats"); // seats | salesManagement | payroll
  const [activeSeat, setActiveSeat] = useState(null);
  const [guestModalSeat, setGuestModalSeat] = useState(null);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [unlockedTabs, setUnlockedTabs] = useState(() => new Set());
  const [pendingLockTab, setPendingLockTab] = useState(null);
  const dataRef = useRef(null);

  // 初期読み込み(localStorage / オフライン対応)
  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const merged = { ...defaultData(), ...parsed };
          setData(merged);
          dataRef.current = merged;
        } else {
          const d = defaultData();
          setData(d);
          dataRef.current = d;
        }
      } catch (e) {
        const d = defaultData();
        setData(d);
        dataRef.current = d;
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // タイマー更新(30秒毎)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // ブラウザの戻る/進むボタン対策。画面遷移はReact内部のstateのみで行い
  // ブラウザ履歴(URL)は使わない構成のため、戻る操作でアプリ自体から
  // 抜けてしまわないよう、履歴が動くたびに同じURLを積み直して無効化する。
  useEffect(() => {
    const trapHistory = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", trapHistory);
    return () => window.removeEventListener("popstate", trapHistory);
  }, []);

  const persist = useCallback(async (newData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setData(newData);
      dataRef.current = newData;
      setSaveError(false);
    } catch (e) {
      // 容量超過(QuotaExceededError)などはここに来る
      // localStorage失敗時は state を変更しない(UIと永続化の整合性を保つ)
      setSaveError(true);
    }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  if (loading || !data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: COLORS.inkSoft, fontFamily: SANS }}>
        読み込み中...
      </div>
    );
  }

  const goToHomeTab = (tab) => {
    setHomeTab(tab);
    setScreen(tab === "seats" ? "top" : tab);
  };

  const handleSelectHomeTab = (tab) => {
    const security = data.security;
    if (SECURITY_SCREEN_ORDER.includes(tab) && security.enabled[tab]) {
      const needsCheck = security.lockMode === "always" || !unlockedTabs.has(tab);
      if (needsCheck) {
        setPendingLockTab(tab);
        return;
      }
    }
    goToHomeTab(tab);
  };

  const handleUnlockSuccess = () => {
    const tab = pendingLockTab;
    setUnlockedTabs((prev) => new Set(prev).add(tab));
    setPendingLockTab(null);
    goToHomeTab(tab);
  };

  const onUpdateSecurity = (patch) => {
    persist({ ...dataRef.current, security: { ...dataRef.current.security, ...patch } });
  };

  const onResetSecurity = () => {
    persist({
      ...dataRef.current,
      security: {
        ...dataRef.current.security,
        enabled: { salesManagement: false, payroll: false },
        passwords: { salesManagement: "", payroll: "" },
      },
    });
    setUnlockedTabs(new Set());
  };

  const onUpdatePayroll = (patch) => {
    persist({ ...dataRef.current, payroll: { ...dataRef.current.payroll, ...patch } });
  };

  const onUpdateCashFlow = (date, record) => {
    persist({
      ...dataRef.current,
      cashFlow: { records: { ...dataRef.current.cashFlow.records, [date]: record } },
    });
  };

  const handleSelectSeat = (n) => {
    const seat = data.seats[n];
    if (seat) {
      setActiveSeat(n);
      setScreen("order");
    } else {
      setGuestModalSeat(n);
    }
  };

  const handleConfirmGuests = (count, companion) => {
    const n = guestModalSeat;
    const newSeats = { ...dataRef.current.seats, [n]: { guests: count, companion: companion || "", startTime: new Date().toISOString(), orders: [] } };
    persist({ ...dataRef.current, seats: newSeats });
    setGuestModalSeat(null);
    setActiveSeat(n);
    setScreen("order");
  };

  const handleUpdateOrders = (newOrders) => {
    const n = activeSeat;
    const seat = dataRef.current.seats[n];
    const newSeats = { ...dataRef.current.seats, [n]: { ...seat, orders: newOrders } };
    persist({ ...dataRef.current, seats: newSeats });
  };

  const handleCancelSeat = (n) => {
    const newSeats = { ...dataRef.current.seats };
    delete newSeats[n];
    persist({ ...dataRef.current, seats: newSeats });
    setActiveSeat(null);
    setScreen("top");
    showToast(`座席${n} を取り消しました`);
  };

  const handleCheckoutConfirm = (payments, bill, memo) => {
    const n = activeSeat;
    const seat = dataRef.current.seats[n];
    const record = {
      id: uid("sale"),
      seatId: n,
      seatName: dataRef.current.seatNames?.[n] || "",
      guests: seat.guests,
      companion: companionLabel(seat.companion),
      startTime: seat.startTime,
      endTime: new Date().toISOString(),
      orders: seat.orders,
      subtotal: bill.subtotal,
      serviceRate: bill.serviceRate,
      serviceCharge: bill.serviceCharge,
      taxRate: bill.taxRate,
      tax: bill.tax,
      total: bill.total,
      payments,
      memo: memo || "",
    };
    const newSeats = { ...dataRef.current.seats };
    delete newSeats[n];
    persist({ ...dataRef.current, seats: newSeats, salesHistory: [...dataRef.current.salesHistory, record] });
    setActiveSeat(null);
    setScreen("top");
    showToast(`座席${n} 会計完了 ${formatYen(bill.total)}`);
  };

  const seat = activeSeat ? data.seats[activeSeat] : null;

  return (
    <div
      className="pos-app-shell"
      style={{
        fontFamily: SANS,
        background: COLORS.bg,
        color: COLORS.ink,
        marginTop: HEADER_CLOCK_FONT_SIZE,
        height: `calc(100vh - ${HEADER_CLOCK_FONT_SIZE}px)`,
        maxHeight: 780 - HEADER_CLOCK_FONT_SIZE,
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      {screen === "top" && (
        <TopScreen
          data={data}
          now={now}
          onSelectSeat={handleSelectSeat}
          onOpenSettings={() => setScreen("settings")}
          activeHomeTab={homeTab}
          onSelectHomeTab={handleSelectHomeTab}
        />
      )}

      {screen === "order" && seat && (
        <OrderScreen
          seatNum={activeSeat}
          seatName={data.seatNames?.[activeSeat]}
          seat={seat}
          products={data.products}
          now={now}
          onUpdateOrders={handleUpdateOrders}
          onBack={() => { setScreen("top"); setActiveSeat(null); }}
          onGoCheckout={() => setScreen("checkout")}
          onCancelSeat={handleCancelSeat}
        />
      )}

      {screen === "checkout" && seat && (
        <CheckoutScreen
          seatNum={activeSeat}
          seat={seat}
          data={data}
          now={now}
          onBack={() => setScreen("order")}
          onConfirm={handleCheckoutConfirm}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen
          data={data}
          onBack={() => setScreen(homeTab === "seats" ? "top" : homeTab)}
          onUpdateProducts={(list) => persist({ ...dataRef.current, products: list })}
          onUpdateSeatCount={(n) => persist({ ...dataRef.current, seatCount: n })}
          onUpdateSeatName={(n, name) => persist({ ...dataRef.current, seatNames: { ...dataRef.current.seatNames, [n]: name } })}
          onUpdateRates={(service, tax) => persist({ ...dataRef.current, serviceChargeRate: service, taxRate: tax })}
          onUpdateSeatToneThresholds={(warn, danger) =>
            persist({ ...dataRef.current, seatToneThresholds: { warnMinutes: warn, dangerMinutes: danger } })
          }
          onImportData={(restored) => persist({ ...defaultData(), ...restored })}
          onImportDataPeriod={(restored, filtered) =>
            persist({
              ...defaultData(),
              ...restored,
              seats: dataRef.current.seats, // 現在使用中の座席(営業中データ)は復元対象外
              salesHistory: filtered.salesHistory,
              payroll: { ...defaultData().payroll, ...restored.payroll, shifts: filtered.shifts },
              cashFlow: { records: filtered.cashFlowRecords },
            })
          }
          onDeleteAllData={() => persist(defaultData())}
          onUpdateSecurity={onUpdateSecurity}
          onResetSecurity={onResetSecurity}
          showToast={showToast}
        />
      )}

      {screen === "salesManagement" && (
        <SalesManagementScreen
          data={data}
          onUpdateCashFlow={onUpdateCashFlow}
          onOpenSettings={() => setScreen("settings")}
          activeHomeTab={homeTab}
          onSelectHomeTab={handleSelectHomeTab}
          onSelectSale={(id) => { setSelectedSaleId(id); setScreen("historyDetail"); }}
        />
      )}

      {screen === "payroll" && (
        <PayrollScreen
          payroll={data.payroll}
          onUpdatePayroll={onUpdatePayroll}
          onOpenSettings={() => setScreen("settings")}
          activeHomeTab={homeTab}
          onSelectHomeTab={handleSelectHomeTab}
          showToast={showToast}
        />
      )}

      {screen === "historyDetail" && (() => {
        const sale = data.salesHistory.find((s) => s.id === selectedSaleId);
        if (!sale) {
          return (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Header title="会計明細" onBack={() => { setSelectedSaleId(null); setScreen("salesManagement"); }} />
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inkSoft, fontSize: 13 }}>
                データが見つかりませんでした
              </div>
            </div>
          );
        }
        return (
          <HistoryDetailScreen
            sale={sale}
            onBack={() => { setSelectedSaleId(null); setScreen("salesManagement"); }}
          />
        );
      })()}

      {guestModalSeat !== null && (
        <GuestCountModal seatNum={guestModalSeat} employees={data.payroll?.employees || []} onConfirm={handleConfirmGuests} onCancel={() => setGuestModalSeat(null)} />
      )}

      {pendingLockTab && (
        <PasswordPromptModal
          label={SECURITY_SCREEN_LABELS[pendingLockTab]}
          stored={data.security.passwords[pendingLockTab]}
          onCancel={() => setPendingLockTab(null)}
          onSuccess={handleUnlockSuccess}
        />
      )}

      <Toast message={toast} />

      {saveError && (
        <div style={{ position: "fixed", top: 10, left: "50%", transform: "translateX(-50%)", background: COLORS.brick, color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 12.5, zIndex: 300 }}>
          保存に失敗しました。通信状況をご確認ください。
        </div>
      )}
    </div>
  );
}
