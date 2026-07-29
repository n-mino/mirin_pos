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
    salesHistory: [],
    serviceChargeRate: 0, // %
    taxRate: 10, // %
    payroll: { employees: [], shifts: [] },
    cashFlow: { records: {} }, // 日付(YYYY-MM-DD) -> { expenses:[], income:[] }
  };
}

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

function seatTone(minutes) {
  if (minutes < 30) return { fg: COLORS.sage, bg: COLORS.sageBg, label: "" };
  if (minutes < 60) return { fg: COLORS.amber, bg: COLORS.amberBg, label: "" };
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

// CSVセル内にカンマ・改行・ダブルクォートが含まれる場合に備えたエスケープ
function csvEscape(value) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
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
          <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.65, fontFamily: MONO }}>
            SIMPLE POS
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
  { id: "history", label: "売上履歴" },
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
          fontSize: 12,
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
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 14,
          }}
        >
          {seatNums.map((n) => {
            const seat = data.seats[n];
            const occupied = !!seat;
            const mins = occupied ? elapsedMinutes(seat.startTime, now) : 0;
            const tone = occupied ? seatTone(mins) : { fg: COLORS.inkSoft, bg: COLORS.paper };
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
                    <span style={{ fontSize: 11, fontFamily: MONO, color: tone.fg, fontWeight: 700 }}>
                      ● 使用中
                    </span>
                  )}
                </div>
                {occupied ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: COLORS.inkSoft }}>
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
function GuestCountModal({ seatNum, onConfirm, onCancel }) {
  const [count, setCount] = useState(2);
  const quick = [1, 2, 3, 4, 5, 6, 8];

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

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 22 }}>
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

        <div style={{ display: "flex", gap: 10 }}>
          <TicketButton variant="ghost" onClick={onCancel} style={{ flex: 1 }}>キャンセル</TicketButton>
          <TicketButton variant="primary" onClick={() => onConfirm(count)} style={{ flex: 1 }}>開始する</TicketButton>
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
        title={seatDisplayLabel(seatNum, seatName)}
        onBack={onBack}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 12 }}>
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
                    style={{
                      background: active ? COLORS.amberBg : COLORS.paper,
                      border: `1.5px solid ${active ? COLORS.amber : COLORS.line}`,
                      borderRadius: 8,
                      padding: "14px 10px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink, marginBottom: 6 }}>{p.name}</div>
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
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.inkSoft, fontFamily: MONO, marginBottom: 10 }}>
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

/* ---------------------------------------------------------
   マスタ設定画面
--------------------------------------------------------- */
function SettingsScreen({ data, onBack, onUpdateProducts, onUpdateSeatCount, onUpdateSeatName, onUpdateRates, onImportData }) {
  const [tab, setTab] = useState("products");
  const [editing, setEditing] = useState(null); // product being edited, or {} for new
  const [serviceInput, setServiceInput] = useState(String(data.serviceChargeRate ?? 0));
  const [taxInput, setTaxInput] = useState(String(data.taxRate ?? 0));
  const [importError, setImportError] = useState("");
  const [importOk, setImportOk] = useState("");
  const [storageEstimate, setStorageEstimate] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(setStorageEstimate).catch(() => {});
    }
  }, []);

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

  const exportSalesCsv = () => {
    const rows = [["会計ID", "日時", "座席", "人数", "小計", "サービス料", "消費税", "合計", "現金", "カード", "PayPay", "ツケ", "メモ"]];
    (data.salesHistory || []).forEach((s) => {
      rows.push([
        s.id, s.endTime, seatDisplayLabel(s.seatId, s.seatName), s.guests, s.subtotal, s.serviceCharge, s.tax, s.total,
        s.payments?.cash || 0, s.payments?.card || 0, s.payments?.paypay || 0, s.payments?.onAccount || 0,
        s.memo || "",
      ]);
    });
    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `sales-history_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
        onImportData(restored);
        setImportOk("データを復元しました");
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
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="マスタ設定" onBack={onBack} />

      <div style={{ display: "flex", gap: 6, padding: "12px 20px", borderBottom: `1px solid ${COLORS.line}`, background: COLORS.paper, overflowX: "auto" }}>
        {[{ id: "products", label: "商品管理" }, { id: "seats", label: "座席設定" }, { id: "rates", label: "税・サービス料" }, { id: "data", label: "データ管理" }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
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
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20, maxWidth: 560, margin: "0 auto", width: "100%" }}>
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
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.inkSoft, fontFamily: MONO }}>{p.category} ・ {formatYen(p.price)}</div>
                    {p.timePrice && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: COLORS.amber, fontFamily: MONO, marginTop: 3 }}>
                        <Clock size={11} /> {p.timePrice.start}〜{p.timePrice.end} {formatYen(p.timePrice.price)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
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
          <>
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
          </>
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
                </div>
              );
            })()}

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: COLORS.ink, fontWeight: 700, marginBottom: 8 }}>バックアップの書き出し</div>
              <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 10 }}>
                商品・座席・売上履歴・設定をすべて含むJSONファイルをダウンロードします。
              </div>
              <TicketButton variant="primary" onClick={exportData} style={{ width: "100%", marginBottom: 8 }}>
                全データをJSONで書き出す
              </TicketButton>
              <TicketButton variant="ghost" onClick={exportSalesCsv} style={{ width: "100%" }}>
                売上履歴のみCSVで書き出す
              </TicketButton>
            </div>

            <div style={{ height: 1, background: COLORS.line, margin: "20px 0" }} />

            <div>
              <div style={{ fontSize: 13, color: COLORS.ink, fontWeight: 700, marginBottom: 8 }}>バックアップの復元</div>
              <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 10, lineHeight: 1.6 }}>
                書き出したJSONファイルを選択すると、現在この端末にあるデータを上書きします。この操作は取り消せません。
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportFile}
                style={{ fontSize: 13, marginBottom: 8 }}
              />
              {importError && (
                <div style={{ fontSize: 12, color: COLORS.brick, marginTop: 8 }}>{importError}</div>
              )}
              {importOk && (
                <div style={{ fontSize: 12, color: COLORS.sage, marginTop: 8 }}>{importOk}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {editing !== null && (
        <ProductEditModal
          product={editing}
          categories={Array.from(new Set(data.products.map((p) => p.category)))}
          onCancel={() => setEditing(null)}
          onSave={saveProduct}
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
   売上履歴画面
--------------------------------------------------------- */
const HISTORY_TABLE_COLS = "170px 110px 60px 90px 90px 90px 100px 90px 90px 90px 90px 160px";

function HistoryScreen({ salesHistory, onSelectSale, onOpenSettings, activeHomeTab, onSelectHomeTab }) {
  const [mode, setMode] = useState("today"); // today | all | date
  const [dateValue, setDateValue] = useState(toDateInputValue(new Date().toISOString()));

  const filtered = salesHistory
    .filter((s) => {
      if (mode === "today") return isToday(s.endTime);
      if (mode === "date") return isSameDate(s.endTime, dateValue);
      return true;
    })
    .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

  const totalAmount = filtered.reduce((sum, s) => sum + s.total, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header
        title="売上履歴"
        right={<HeaderIconButton icon={Settings} onClick={onOpenSettings} title="マスタ設定" />}
      />

      <HomeTabBar active={activeHomeTab} onSelect={onSelectHomeTab} />

      <div style={{ padding: "12px 20px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", borderBottom: `1px solid ${COLORS.line}`, background: COLORS.paper }}>
        <button
          onClick={() => setMode("today")}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: `1.5px solid ${mode === "today" ? COLORS.teal : COLORS.line}`,
            background: mode === "today" ? COLORS.teal : "transparent",
            color: mode === "today" ? "#FBF9F4" : COLORS.inkSoft,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          本日のみ
        </button>
        <button
          onClick={() => setMode("all")}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: `1.5px solid ${mode === "all" ? COLORS.teal : COLORS.line}`,
            background: mode === "all" ? COLORS.teal : "transparent",
            color: mode === "all" ? "#FBF9F4" : COLORS.inkSoft,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          すべて
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 20,
            border: `1.5px solid ${mode === "date" ? COLORS.teal : COLORS.line}`,
            background: mode === "date" ? COLORS.sageBg : "transparent",
          }}
        >
          <CalendarDays size={14} color={COLORS.inkSoft} />
          <input
            type="date"
            value={dateValue}
            onChange={(e) => { setDateValue(e.target.value); setMode("date"); }}
            style={{ border: "none", background: "transparent", fontFamily: MONO, fontSize: 13, color: COLORS.ink }}
          />
        </div>
      </div>

      <div
        style={{
          padding: "10px 20px",
          display: "flex",
          gap: 20,
          fontFamily: MONO,
          fontSize: 12,
          color: COLORS.inkSoft,
          borderBottom: `1px dashed ${COLORS.line}`,
          background: COLORS.paper,
        }}
      >
        <span>会計 {filtered.length}件</span>
        <span>合計 {formatYen(totalAmount)}</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {filtered.length === 0 && (
          <div style={{ color: COLORS.inkSoft, fontSize: 13, padding: "40px 0", textAlign: "center" }}>
            該当する会計データがありません
          </div>
        )}
        {filtered.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 1230 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: HISTORY_TABLE_COLS,
                  gap: 4,
                  padding: "8px 10px",
                  borderBottom: `1px solid ${COLORS.line}`,
                  fontSize: 11.5,
                  color: COLORS.inkSoft,
                  fontWeight: 700,
                }}
              >
                <div>日時</div>
                <div>座席</div>
                <div>人数</div>
                <div>小計</div>
                <div>サービス料</div>
                <div>消費税</div>
                <div>合計</div>
                <div>現金</div>
                <div>カード</div>
                <div>PayPay</div>
                <div>売掛</div>
                <div>メモ</div>
              </div>
              {filtered.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectSale(s.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: HISTORY_TABLE_COLS,
                    gap: 4,
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    borderBottom: `1px dashed ${COLORS.line}`,
                    fontSize: 12.5,
                    fontFamily: MONO,
                    background: "transparent",
                    border: "none",
                    borderBottomStyle: "dashed",
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.line,
                    cursor: "pointer",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontFamily: SANS, color: COLORS.ink }}>{formatDateTimeRange(s.startTime, s.endTime)}</div>
                  <div style={{ fontFamily: SANS, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {seatDisplayLabel(s.seatId, s.seatName)}
                  </div>
                  <div>{s.guests}名</div>
                  <div>{formatYen(s.subtotal)}</div>
                  <div>{formatYen(s.serviceCharge)}</div>
                  <div>{formatYen(s.tax)}</div>
                  <div style={{ fontWeight: 700, color: COLORS.teal }}>{formatYen(s.total)}</div>
                  <div>{s.payments?.cash ? formatYen(s.payments.cash) : "-"}</div>
                  <div>{s.payments?.card ? formatYen(s.payments.card) : "-"}</div>
                  <div>{s.payments?.paypay ? formatYen(s.payments.paypay) : "-"}</div>
                  <div>{s.payments?.onAccount ? formatYen(s.payments.onAccount) : "-"}</div>
                  <div style={{ fontFamily: SANS, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.memo || ""}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: COLORS.inkSoft, fontFamily: MONO, marginBottom: 10 }}>
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
  const [screen, setScreen] = useState("top"); // top | order | checkout | settings | history | historyDetail | salesManagement | payroll
  const [homeTab, setHomeTab] = useState("seats"); // seats | history | salesManagement | payroll
  const [activeSeat, setActiveSeat] = useState(null);
  const [guestModalSeat, setGuestModalSeat] = useState(null);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState("");
  const [saveError, setSaveError] = useState(false);
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

  const persist = useCallback(async (newData) => {
    setData(newData);
    dataRef.current = newData;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setSaveError(false);
    } catch (e) {
      // 容量超過(QuotaExceededError)などはここに来る
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

  const handleSelectHomeTab = (tab) => {
    setHomeTab(tab);
    setScreen(tab === "seats" ? "top" : tab);
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

  const handleConfirmGuests = (count) => {
    const n = guestModalSeat;
    const newSeats = { ...dataRef.current.seats, [n]: { guests: count, startTime: new Date().toISOString(), orders: [] } };
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
        height: "100vh",
        maxHeight: 780,
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
          onImportData={(restored) => persist({ ...defaultData(), ...restored })}
        />
      )}

      {screen === "history" && (
        <HistoryScreen
          salesHistory={data.salesHistory}
          onSelectSale={(id) => { setSelectedSaleId(id); setScreen("historyDetail"); }}
          onOpenSettings={() => setScreen("settings")}
          activeHomeTab={homeTab}
          onSelectHomeTab={handleSelectHomeTab}
        />
      )}

      {screen === "salesManagement" && (
        <SalesManagementScreen
          data={data}
          onUpdateCashFlow={onUpdateCashFlow}
          onOpenSettings={() => setScreen("settings")}
          activeHomeTab={homeTab}
          onSelectHomeTab={handleSelectHomeTab}
        />
      )}

      {screen === "payroll" && (
        <PayrollScreen
          payroll={data.payroll}
          onUpdatePayroll={onUpdatePayroll}
          onOpenSettings={() => setScreen("settings")}
          activeHomeTab={homeTab}
          onSelectHomeTab={handleSelectHomeTab}
        />
      )}

      {screen === "historyDetail" && (() => {
        const sale = data.salesHistory.find((s) => s.id === selectedSaleId);
        if (!sale) {
          return (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Header title="会計明細" onBack={() => { setSelectedSaleId(null); setScreen("history"); }} />
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inkSoft, fontSize: 13 }}>
                データが見つかりませんでした
              </div>
            </div>
          );
        }
        return (
          <HistoryDetailScreen
            sale={sale}
            onBack={() => { setSelectedSaleId(null); setScreen("history"); }}
          />
        );
      })()}

      {guestModalSeat !== null && (
        <GuestCountModal seatNum={guestModalSeat} onConfirm={handleConfirmGuests} onCancel={() => setGuestModalSeat(null)} />
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
