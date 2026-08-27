/* ---------------------------------------------------------
   アルバイト給与計算(勤怠入力・集計)

   app.jsx で定義されたグローバル(COLORS/MONO/DISPLAY/SANS/
   各アイコン/TicketButton/Header/HeaderIconButton/HomeTabBar/
   ConfirmModal/formatYen/uid/toDateInputValue/useMediaQuery/
   React hooks)をそのまま再利用する。ビルドツールを使わない
   構成のため、このファイルは index.html 内で app.jsx より
   後に <script type="text/babel"> で読み込むこと。
--------------------------------------------------------- */

const PAYROLL_EMPLOYEE_COLORS = [
  COLORS.teal,
  COLORS.amber,
  COLORS.brick,
  COLORS.sage,
  "#7A6A4F", // 落ち着いたオリーブブラウン
  "#3E6B7A", // 落ち着いたティールブルー
  "#8C5A6B", // 落ち着いたプラム
  COLORS.inkSoft,
];

function payrollShiftMinutes(startTime, endTime) {
  const [sh, sm] = (startTime || "0:0").split(":").map(Number);
  const [eh, em] = (endTime || "0:0").split(":").map(Number);
  const startMin = (sh || 0) * 60 + (sm || 0);
  const endMin = (eh || 0) * 60 + (em || 0);
  let diff = endMin - startMin;
  if (diff === 0) return null;
  if (diff < 0) diff += 24 * 60; // 日をまたぐ勤務
  return diff;
}

// 開始時刻からの分オフセットで[start, end)の範囲を返す(日をまたぐ勤務はendがstartを超える形で正規化される)
function payrollShiftRange(startTime, endTime) {
  const [sh, sm] = (startTime || "0:0").split(":").map(Number);
  const start = (sh || 0) * 60 + (sm || 0);
  const minutes = payrollShiftMinutes(startTime, endTime) || 0;
  return { start, end: start + minutes };
}

function payrollShiftRangesOverlap(a, b) {
  return a.start < b.end && b.start < a.end;
}

// ランク別時給アップ額(1時間あたり、全従業員共通)。data.payroll.rankBonusRates
// が未設定(旧データ)の場合にフォールバックするデフォルト値でもある。
const PAYROLL_DEFAULT_RANK_BONUS_RATES = { call: 100, companion: 200, other: 0 };

const PAYROLL_RANK_OPTIONS = [
  { key: "call", label: "呼込み" },
  { key: "companion", label: "同伴" },
  { key: "other", label: "その他" },
];

function payrollRankBonus(rankBonusRates, rankKey) {
  if (!rankKey) return 0;
  const rates = rankBonusRates || PAYROLL_DEFAULT_RANK_BONUS_RATES;
  return rates[rankKey] ?? PAYROLL_DEFAULT_RANK_BONUS_RATES[rankKey] ?? 0;
}

// 売上バックの率(%)。現時点では入力欄の用意のみで、計算には使用しない(ユーザー指示による)。
const PAYROLL_DEFAULT_SALES_BACK_RATES = { over30k: 10, group5over50k: 30, bottle: 10 };

function payrollRankLabel(rankKey) {
  return PAYROLL_RANK_OPTIONS.find((o) => o.key === rankKey)?.label || "";
}

function payrollRankColor(rankKey) {
  if (rankKey === "call") return COLORS.amber;
  if (rankKey === "companion") return COLORS.brick;
  if (rankKey === "other") return COLORS.teal;
  return COLORS.inkSoft;
}

function payrollShiftTotal(shift, employees, rankBonusRates) {
  const emp = employees.find((e) => e.id === shift.employeeId);
  const wage = (emp ? emp.hourlyWage : 0) + payrollRankBonus(rankBonusRates, shift.rankKey);
  const minutes = payrollShiftMinutes(shift.startTime, shift.endTime);
  const hours = minutes === null ? 0 : minutes / 60;
  const dailyWage = shift.dailyWage || 0;
  const base = dailyWage > 0 ? dailyWage : hours * wage;
  // 同伴バック(option)と売上バック(option2)は両方に値があっても加算せず、大きい方のみを採用する
  const back = Math.max(shift.option || 0, shift.option2 || 0);
  return { hours, total: base + back, wage };
}

function payrollPeriodKey(dateStr, period) {
  return period === "monthly" ? dateStr.slice(0, 7) : dateStr.slice(0, 4);
}

function payrollEmployeeColor(employeeId, employees) {
  const idx = employees.findIndex((e) => e.id === employeeId);
  return PAYROLL_EMPLOYEE_COLORS[(idx < 0 ? 0 : idx) % PAYROLL_EMPLOYEE_COLORS.length];
}

function formatHours(n) {
  return `${n.toFixed(1)}時間`;
}

const payrollSelectStyle = {
  padding: "7px 10px",
  borderRadius: 6,
  border: `1.5px solid ${COLORS.line}`,
  fontFamily: MONO,
  fontSize: 13,
  background: COLORS.paper,
  color: COLORS.ink,
};

function payrollPillStyle(active) {
  return {
    padding: "7px 14px",
    borderRadius: 20,
    border: `1.5px solid ${active ? COLORS.teal : COLORS.line}`,
    background: active ? COLORS.teal : "transparent",
    color: active ? "#FBF9F4" : COLORS.inkSoft,
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
    flexShrink: 0,
    cursor: "pointer",
  };
}

const payrollIconBtnStyle = {
  width: 32,
  height: 32,
  borderRadius: 6,
  border: `1px solid ${COLORS.line}`,
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const payrollFieldInputStyle = {
  width: "100%",
  padding: "9px 10px",
  borderRadius: 6,
  border: `1.5px solid ${COLORS.line}`,
  marginTop: 4,
  fontSize: 14,
  background: COLORS.paper,
  color: COLORS.ink,
};

const PAYROLL_TIME_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const PAYROLL_TIME_MINUTES = ["00", "15", "30", "45"];

// ネイティブ<input type="time">はOS/ブラウザによってstepの分刻み制限が
// 効かない(自由に分を入力・選択できてしまう)ため、時・分を別セレクトにして
// 15分単位以外を選べないようにする
function TimeStepSelect({ value, onChange }) {
  const [h, m] = (value || "").split(":");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      <select
        value={h || ""}
        onChange={(e) => onChange(`${e.target.value}:${m || "00"}`)}
        style={{ ...payrollFieldInputStyle, width: "auto", flex: 1, marginTop: 0, fontFamily: MONO }}
      >
        <option value="" disabled>時</option>
        {PAYROLL_TIME_HOURS.map((hh) => (
          <option key={hh} value={hh}>{hh}</option>
        ))}
      </select>
      <span style={{ color: COLORS.inkSoft }}>:</span>
      <select
        value={m || ""}
        onChange={(e) => onChange(`${h || "00"}:${e.target.value}`)}
        style={{ ...payrollFieldInputStyle, width: "auto", flex: 1, marginTop: 0, fontFamily: MONO }}
      >
        <option value="" disabled>分</option>
        {PAYROLL_TIME_MINUTES.map((mm) => (
          <option key={mm} value={mm}>{mm}</option>
        ))}
      </select>
    </div>
  );
}

/* ---------------------------------------------------------
   アルバイト管理
--------------------------------------------------------- */
function EmployeeListPanel({ employees, onAdd, onEdit, onDelete }) {
  return (
    <>
      <TicketButton variant="primary" onClick={onAdd} icon={Plus} style={{ marginBottom: 16 }}>
        アルバイトを追加
      </TicketButton>
      {employees.length === 0 ? (
        <div style={{ color: COLORS.inkSoft, fontSize: 13, padding: "20px 0", textAlign: "center" }}>
          アルバイトがまだ登録されていません。
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {employees.map((emp) => (
            <div
              key={emp.id}
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
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{emp.name}</div>
                <div style={{ fontSize: 12, color: COLORS.inkSoft, fontFamily: MONO }}>時給 {formatYen(emp.hourlyWage)}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => onEdit(emp)} style={payrollIconBtnStyle}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => onDelete(emp.id)} style={{ ...payrollIconBtnStyle, border: `1px solid ${COLORS.brick}`, color: COLORS.brick }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function EmployeeEditModal({ employee, onCancel, onSave }) {
  const [name, setName] = useState(employee.name || "");
  const [wage, setWage] = useState(employee.hourlyWage != null ? String(employee.hourlyWage) : "");

  const valid = name.trim().length > 0 && wage !== "" && Number(wage) >= 0;

  const handleSave = () => {
    onSave({ ...employee, name: name.trim(), hourlyWage: Number(wage) });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,24,20,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20, overflowY: "auto" }}>
      <div style={{ background: COLORS.paper, borderRadius: 12, padding: 24, width: "100%", maxWidth: 380, boxShadow: "0 12px 40px rgba(0,0,0,0.25)", margin: "20px 0" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, marginBottom: 18, color: COLORS.ink }}>
          {employee.id ? "アルバイトを編集" : "アルバイトを追加"}
        </div>

        <label style={{ fontSize: 12, color: COLORS.inkSoft }}>名前</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 山田太郎"
          style={{ ...payrollFieldInputStyle, marginBottom: 14 }}
        />

        <label style={{ fontSize: 12, color: COLORS.inkSoft }}>時給(円)</label>
        <input
          type="number"
          min="0"
          value={wage}
          onChange={(e) => setWage(e.target.value)}
          placeholder="例: 1100"
          style={{ ...payrollFieldInputStyle, marginBottom: 14, fontFamily: MONO }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <TicketButton variant="ghost" onClick={onCancel} style={{ flex: 1 }}>キャンセル</TicketButton>
          <TicketButton variant="primary" disabled={!valid} onClick={handleSave} style={{ flex: 1 }}>保存</TicketButton>
        </div>
      </div>
    </div>
  );
}

// アルバイトマスタ右側の「ランク別時給アップ額」設定。全従業員共通の1時間
// あたりの加算額を保存する(税・サービス料タブと同じ、ローカルstate→保存ボタンで
// 一括適用するパターン)。
function RankBonusSettingsPanel({ rankBonusRates, onSave }) {
  const initial = (key) => String(rankBonusRates?.[key] ?? PAYROLL_DEFAULT_RANK_BONUS_RATES[key]);
  const [call, setCall] = useState(initial("call"));
  const [companion, setCompanion] = useState(initial("companion"));
  const [other, setOther] = useState(rankBonusRates?.other != null ? String(rankBonusRates.other) : "");

  const handleSave = () => {
    onSave({
      call: Math.max(0, Number(call) || 0),
      companion: Math.max(0, Number(companion) || 0),
      other: Math.max(0, Number(other) || 0),
    });
  };

  return (
    <div style={{ background: COLORS.paper, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: 20 }}>
      <div style={{ fontSize: 13, color: COLORS.ink, fontWeight: 700, marginBottom: 8 }}>ランク別時給アップ額</div>
      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 18, lineHeight: 1.6 }}>
        勤怠入力でランクを選ぶと、時給に1時間あたりこの金額が加算されます。全従業員共通の設定です。
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: COLORS.inkSoft, width: 100, flexShrink: 0 }}>呼込み(円/時)</label>
        <input type="number" min="0" value={call} onChange={(e) => setCall(e.target.value)} style={{ ...payrollFieldInputStyle, marginTop: 0, fontFamily: MONO }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: COLORS.inkSoft, width: 100, flexShrink: 0 }}>同伴(円/時)</label>
        <input type="number" min="0" value={companion} onChange={(e) => setCompanion(e.target.value)} style={{ ...payrollFieldInputStyle, marginTop: 0, fontFamily: MONO }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <label style={{ fontSize: 12, color: COLORS.inkSoft, width: 100, flexShrink: 0 }}>その他(円/時)</label>
        <input type="number" min="0" value={other} onChange={(e) => setOther(e.target.value)} placeholder="任意" style={{ ...payrollFieldInputStyle, marginTop: 0, fontFamily: MONO }} />
      </div>

      <TicketButton variant="primary" onClick={handleSave} style={{ width: "100%" }}>保存</TicketButton>
    </div>
  );
}

// アルバイトマスタ右側、ランク別時給アップ額の下に配置する「売上バックの率」設定。
// 「小計30,000円超」「5人以上+小計50,000円超」は会計確定時に自動計算され、売上履歴の
// 「売上バック」列に反映される。「ボトル関連」は判定条件が未定のため入力欄のみで計算には未使用。
const PAYROLL_ROUND_MODES = [
  { key: "floor", label: "切り捨て" },
  { key: "ceil", label: "切り上げ" },
  { key: "round", label: "四捨五入" },
];

function SalesBackRateSettingsPanel({ salesBackRates, onSave }) {
  const initial = (key) => String(salesBackRates?.[key] ?? PAYROLL_DEFAULT_SALES_BACK_RATES[key]);
  const [over30k, setOver30k] = useState(initial("over30k"));
  const [group5over50k, setGroup5over50k] = useState(initial("group5over50k"));
  const [bottle, setBottle] = useState(initial("bottle"));
  const [roundMode, setRoundMode] = useState(salesBackRates?.roundMode || "floor");

  const handleSave = () => {
    onSave({
      over30k: Math.max(0, Number(over30k) || 0),
      group5over50k: Math.max(0, Number(group5over50k) || 0),
      bottle: Math.max(0, Number(bottle) || 0),
      roundMode,
    });
  };

  return (
    <div style={{ background: COLORS.paper, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: 20, marginTop: 20 }}>
      <div style={{ fontSize: 13, color: COLORS.ink, fontWeight: 700, marginBottom: 18 }}>売上バックの率(%)</div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: COLORS.inkSoft, width: 160, flexShrink: 0 }}>小計30,000超</label>
        <input type="number" min="0" value={over30k} onChange={(e) => setOver30k(e.target.value)} style={{ ...payrollFieldInputStyle, marginTop: 0, fontFamily: MONO }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: COLORS.inkSoft, width: 160, flexShrink: 0 }}>5人以上+小計50,000超</label>
        <input type="number" min="0" value={group5over50k} onChange={(e) => setGroup5over50k(e.target.value)} style={{ ...payrollFieldInputStyle, marginTop: 0, fontFamily: MONO }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <label style={{ fontSize: 12, color: COLORS.inkSoft, width: 160, flexShrink: 0 }}>ボトル関連</label>
        <input type="number" min="0" value={bottle} onChange={(e) => setBottle(e.target.value)} style={{ ...payrollFieldInputStyle, marginTop: 0, fontFamily: MONO }} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 12, color: COLORS.inkSoft }}>円未満の端数処理</label>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {PAYROLL_ROUND_MODES.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setRoundMode(opt.key)}
              style={{ ...payrollPillStyle(roundMode === opt.key), flex: 1, textAlign: "center" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <TicketButton variant="primary" onClick={handleSave} style={{ width: "100%" }}>保存</TicketButton>
    </div>
  );
}

/* ---------------------------------------------------------
   勤怠入力
--------------------------------------------------------- */
function ShiftEntryPanel({ employees, shifts, editingShift, onSave, onCancelEdit }) {
  const blank = () => ({
    employeeId: employees[0]?.id || "",
    date: toDateInputValue(new Date().toISOString()),
    startTime: "",
    endTime: "",
    rankKey: "",
    dailyWage: "0",
    option: "0",
    option2: "0",
    note: "",
  });

  const fromShift = (s) => ({
    employeeId: s.employeeId,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    rankKey: s.rankKey || "",
    dailyWage: String(s.dailyWage || 0),
    option: String(s.option || 0),
    option2: String(s.option2 || 0),
    note: s.note || "",
  });

  const [form, setForm] = useState(() => (editingShift ? fromShift(editingShift) : blank()));
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(editingShift ? fromShift(editingShift) : blank());
    setError("");
  }, [editingShift]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (employees.length === 0) {
      setError("先にアルバイトを登録してください。");
      return;
    }
    const minutes = payrollShiftMinutes(form.startTime, form.endTime);
    if (minutes === null) {
      setError("開始時刻と終了時刻が同じです。正しい時刻を入力してください。");
      return;
    }
    const newRange = payrollShiftRange(form.startTime, form.endTime);
    const hasOverlap = shifts.some((s) => {
      if (s.id === editingShift?.id) return false;
      if (s.employeeId !== form.employeeId || s.date !== form.date) return false;
      return payrollShiftRangesOverlap(newRange, payrollShiftRange(s.startTime, s.endTime));
    });
    if (hasOverlap) {
      setError("同じ日に時間帯が重複する勤怠データがすでに存在します。");
      return;
    }
    setError("");
    onSave({
      id: editingShift?.id,
      employeeId: form.employeeId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      rankKey: form.rankKey || "",
      dailyWage: Math.max(0, Number(form.dailyWage) || 0),
      option: Math.max(0, Number(form.option) || 0),
      option2: Math.max(0, Number(form.option2) || 0),
      note: form.note.trim(),
    });
    if (!editingShift) setForm(blank());
  };

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 14 }}>
        {editingShift ? "勤怠編集" : "勤怠入力"}
      </div>

      {employees.length === 0 ? (
        <div style={{ color: COLORS.inkSoft, fontSize: 13, padding: "20px 0", textAlign: "center" }}>
          先にマスタ設定の「アルバイトマスタ」でスタッフを登録してください。
        </div>
      ) : (
        <div style={{ background: COLORS.paper, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: COLORS.inkSoft }}>従業員</label>
            <select value={form.employeeId} onChange={(e) => setField("employeeId", e.target.value)} style={{ ...payrollFieldInputStyle, fontFamily: MONO }}>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: COLORS.inkSoft }}>日付</label>
            <input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} style={{ ...payrollFieldInputStyle, fontFamily: MONO }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: COLORS.inkSoft }}>開始時刻(15分単位)</label>
              <TimeStepSelect value={form.startTime} onChange={(v) => setField("startTime", v)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: COLORS.inkSoft }}>終了時刻(15分単位)</label>
              <TimeStepSelect value={form.endTime} onChange={(v) => setField("endTime", v)} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: COLORS.inkSoft }}>ランク(時給アップ条件)</label>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {PAYROLL_RANK_OPTIONS.map((opt) => {
                const active = form.rankKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => {
                      const next = active ? "" : opt.key;
                      setField("rankKey", next);
                      // 同伴を選んだ際、同伴バックによく使われる金額を自動入力しておく(手入力の手間を減らす目的。手動で変更可能)。
                      // 同伴以外を選んだ場合(解除して通常に戻す場合も含む)は自動入力した金額をクリアする。
                      setField("option", next === "companion" ? "3000" : "0");
                    }}
                    style={{ ...payrollPillStyle(active), flex: 1, textAlign: "center" }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 4 }}>
              選択中のボタンをもう一度押すと解除できます(複数は選択できません)
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: COLORS.inkSoft }}>日給(円・任意)</label>
            <input type="number" min="0" value={form.dailyWage} onChange={(e) => setField("dailyWage", e.target.value)} style={{ ...payrollFieldInputStyle, fontFamily: MONO }} />
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 4 }}>
              値を入力すると、時間による計算の代わりに日給が使用されます
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: COLORS.inkSoft }}>同伴バック(円)</label>
              <input type="number" min="0" value={form.option} onChange={(e) => setField("option", e.target.value)} style={{ ...payrollFieldInputStyle, fontFamily: MONO }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: COLORS.inkSoft }}>売上バック(円)</label>
              <input type="number" min="0" value={form.option2} onChange={(e) => setField("option2", e.target.value)} style={{ ...payrollFieldInputStyle, fontFamily: MONO }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: COLORS.inkSoft }}>メモ(任意)</label>
            <input type="text" value={form.note} onChange={(e) => setField("note", e.target.value)} style={payrollFieldInputStyle} />
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.brick, fontSize: 12.5 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            {editingShift && (
              <TicketButton variant="ghost" onClick={onCancelEdit} style={{ flex: 1 }}>キャンセル</TicketButton>
            )}
            <TicketButton variant="primary" onClick={handleSubmit} icon={Check} style={{ flex: editingShift ? 1 : undefined, width: editingShift ? undefined : "100%" }}>
              {editingShift ? "更新する" : "追加する"}
            </TicketButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   勤怠一覧
--------------------------------------------------------- */
const SHIFT_TABLE_COLS = "100px 90px 100px 110px 70px 80px 90px 80px 80px 80px 90px 140px 100px";

// 勤怠一覧の下に表示する「売上バック内訳」カード。売上履歴に会計確定時点で記録済みの
// 売上バック額(呼込み/同伴の担当者ごと)を、一覧側と同じ日付/個別・全員一括の条件で
// その場で集計するだけの表示専用機能で、勤怠データへの反映(同伴バック/売上バック欄への
// 自動入力)は行わない。日付・名前を見ながら「勤怠一覧の編集」で手入力する運用を想定している。
function SalesBackBreakdownCard({ salesHistory, employees, dateMode, dateValue, viewMode, selectedEmployeeId }) {
  if (dateMode === "all") return null;

  const filteredSales = (salesHistory || []).filter((s) => {
    if (dateMode === "today") return isToday(s.endTime);
    return isSameDate(s.endTime, dateValue);
  });

  const map = new Map();
  filteredSales.forEach((s) => {
    const kind = companionEffectiveKind(s.companion, s.companionKind);
    if (!kind) return;
    const amount = s.salesBackAmount || 0;
    if (amount <= 0) return;
    const name = companionLabel(s.companion);
    if (viewMode === "individual") {
      const emp = employees.find((e) => e.id === selectedEmployeeId);
      if (!emp || emp.name !== name) return;
    }
    map.set(name, (map.get(name) || 0) + amount);
  });

  const entries = Array.from(map.entries());
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  const label = dateMode === "today" ? "本日" : dateValue;

  return (
    <div style={{ background: COLORS.paper, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: 20, marginTop: 20 }}>
      <div style={{ fontSize: 13, color: COLORS.ink, fontWeight: 700, marginBottom: 12 }}>売上バック内訳({label})</div>
      {entries.length === 0 ? (
        <div style={{ fontSize: 12, color: COLORS.inkSoft, textAlign: "center", padding: "6px 0" }}>該当する売上バックはありません。</div>
      ) : (
        <>
          {entries.map(([name, amount]) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px dashed ${COLORS.line}`, fontSize: 13, color: COLORS.ink }}>
              <span>{name}</span>
              <span style={{ fontFamily: MONO, fontWeight: 700, color: COLORS.sage }}>{formatYen(amount)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: COLORS.inkSoft, fontWeight: 700 }}>合計</span>
            <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: COLORS.ink }}>{formatYen(total)}</span>
          </div>
        </>
      )}
    </div>
  );
}

function ShiftListPanel({ employees, shifts, rankBonusRates, salesHistory, onEdit, onDelete, onTogglePaid }) {
  const [viewMode, setViewMode] = useState("all"); // individual | all
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || "");
  const [dateMode, setDateMode] = useState("today"); // today | all | date
  const [dateValue, setDateValue] = useState(toDateInputValue(new Date().toISOString()));
  const [deletingShiftId, setDeletingShiftId] = useState(null);

  useEffect(() => {
    if (!employees.some((e) => e.id === selectedEmployeeId)) {
      setSelectedEmployeeId(employees[0]?.id || "");
    }
  }, [employees]);

  let list = shifts.slice();
  if (viewMode === "individual") {
    list = list.filter((s) => s.employeeId === selectedEmployeeId);
  }
  list = list.filter((s) => {
    if (dateMode === "today") return isToday(s.date);
    if (dateMode === "date") return isSameDate(s.date, dateValue);
    return true;
  });
  list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const totalAmount = list.reduce((sum, s) => sum + payrollShiftTotal(s, employees, rankBonusRates).total, 0);

  const exportShiftsCsv = () => {
    const rows = [["日付", "従業員", "開始", "終了", "勤務時間", "時給", "ランク", "日給", "同伴バック", "売上バック", "合計", "メモ", "支払日"]];
    list.forEach((shift) => {
      const emp = employees.find((e) => e.id === shift.employeeId);
      const { hours, total, wage } = payrollShiftTotal(shift, employees, rankBonusRates);
      rows.push([
        shift.date, emp ? emp.name : "(削除済み)", shift.startTime, shift.endTime, formatHours(hours),
        wage, payrollRankLabel(shift.rankKey), shift.dailyWage || 0, shift.option || 0, shift.option2 || 0, total,
        shift.note || "", shift.paidDate || "",
      ]);
    });
    const empSuffix = viewMode === "individual" ? (employees.find((e) => e.id === selectedEmployeeId)?.name || "individual") : "all";
    const dateSuffix = dateMode === "today" ? "today" : dateMode === "date" ? dateValue : "all";
    downloadCsv(`shift-list_${empSuffix}_${dateSuffix}_${csvTimestamp()}.csv`, rows);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setViewMode("individual")} style={payrollPillStyle(viewMode === "individual")}>個別</button>
          <button onClick={() => setViewMode("all")} style={payrollPillStyle(viewMode === "all")}>全員一括</button>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setDateMode("today")} style={payrollPillStyle(dateMode === "today")}>本日のみ</button>
          <button onClick={() => setDateMode("all")} style={payrollPillStyle(dateMode === "all")}>すべて</button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 20,
            border: `1.5px solid ${dateMode === "date" ? COLORS.teal : COLORS.line}`,
            background: dateMode === "date" ? COLORS.sageBg : "transparent",
          }}
        >
          <CalendarDays size={14} color={COLORS.inkSoft} />
          <input
            type="date"
            value={dateValue}
            onChange={(e) => { setDateValue(e.target.value); setDateMode("date"); }}
            style={{ border: "none", background: "transparent", fontFamily: MONO, fontSize: 13, color: COLORS.ink }}
          />
        </div>
        {viewMode === "individual" && employees.length > 0 && (
          <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} style={payrollSelectStyle}>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        )}
        <button
          onClick={exportShiftsCsv}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 20,
            border: `1.5px solid ${COLORS.line}`,
            background: "transparent",
            color: COLORS.inkSoft,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Download size={14} />
          CSVダウンロード
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          fontFamily: MONO,
          fontSize: 13,
          color: COLORS.inkSoft,
          marginBottom: 12,
        }}
      >
        <span>勤怠 {list.length}件</span>
        <span>合計 {formatYen(totalAmount)}</span>
      </div>

      {list.length === 0 ? (
        <div style={{ color: COLORS.inkSoft, fontSize: 13, padding: "20px 0", textAlign: "center" }}>
          勤怠記録がまだありません。
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 1210 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: SHIFT_TABLE_COLS,
                gap: 4,
                padding: "8px 10px",
                borderBottom: `1px solid ${COLORS.line}`,
                fontSize: 11.5,
                color: COLORS.inkSoft,
                fontWeight: 700,
              }}
            >
              <div>操作</div>
              <div>日付</div>
              <div>従業員</div>
              <div>時間</div>
              <div>勤務時間</div>
              <div>時給</div>
              <div>ランク</div>
              <div>日給</div>
              <div>同伴バック</div>
              <div>売上バック</div>
              <div>合計</div>
              <div>メモ</div>
              <div>支払日</div>
            </div>
            {list.map((shift) => {
              const emp = employees.find((e) => e.id === shift.employeeId);
              const { hours, total, wage } = payrollShiftTotal(shift, employees, rankBonusRates);
              return (
                <div
                  key={shift.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: SHIFT_TABLE_COLS,
                    gap: 4,
                    padding: "8px 10px",
                    borderBottom: `1px dashed ${COLORS.line}`,
                    fontSize: 12.5,
                    fontFamily: MONO,
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={() => onTogglePaid(shift.id)}
                      title={shift.paidDate ? "支払い済みを解除" : "支払い済みにする"}
                      style={{
                        ...payrollIconBtnStyle,
                        width: 26,
                        height: 26,
                        background: shift.paidDate ? COLORS.sage : "transparent",
                        border: `1px solid ${shift.paidDate ? COLORS.sage : COLORS.line}`,
                        color: shift.paidDate ? COLORS.paper : COLORS.inkSoft,
                      }}
                    >
                      <Banknote size={12} />
                    </button>
                    <button onClick={() => onEdit(shift.id)} style={{ ...payrollIconBtnStyle, width: 26, height: 26 }}>
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => setDeletingShiftId(shift.id)} style={{ ...payrollIconBtnStyle, width: 26, height: 26, border: `1px solid ${COLORS.brick}`, color: COLORS.brick }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div style={{ fontFamily: SANS, color: COLORS.ink }}>{shift.date}</div>
                  <div style={{ fontFamily: SANS, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {emp ? emp.name : "(削除済み)"}
                  </div>
                  <div>{shift.startTime}-{shift.endTime}</div>
                  <div>{formatHours(hours)}</div>
                  <div>{emp ? formatYen(wage) : "-"}</div>
                  <div>
                    {shift.rankKey ? (
                      <span style={{ color: payrollRankColor(shift.rankKey), fontWeight: 700 }}>
                        {payrollRankLabel(shift.rankKey)}
                      </span>
                    ) : "-"}
                  </div>
                  <div>{shift.dailyWage > 0 ? formatYen(shift.dailyWage) : "-"}</div>
                  <div>{shift.option > 0 ? formatYen(shift.option) : "-"}</div>
                  <div>{shift.option2 > 0 ? formatYen(shift.option2) : "-"}</div>
                  <div style={{ fontWeight: 700, color: COLORS.teal }}>{formatYen(total)}</div>
                  <div style={{ fontFamily: SANS, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {shift.note || ""}
                  </div>
                  <div style={{ fontFamily: SANS, color: shift.paidDate ? COLORS.sage : COLORS.inkSoft, fontWeight: shift.paidDate ? 700 : 400 }}>
                    {shift.paidDate || "-"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SalesBackBreakdownCard
        salesHistory={salesHistory}
        employees={employees}
        dateMode={dateMode}
        dateValue={dateValue}
        viewMode={viewMode}
        selectedEmployeeId={selectedEmployeeId}
      />

      {deletingShiftId && (
        <ConfirmModal
          title="勤怠記録を削除しますか？"
          message="この操作は元に戻せません。"
          confirmLabel="削除する"
          onCancel={() => setDeletingShiftId(null)}
          onConfirm={() => { onDelete(deletingShiftId); setDeletingShiftId(null); }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   集計
--------------------------------------------------------- */
function drawPayrollChart(canvas, { periodKeys, map, activeEmployees, employees, stacked, width, height }) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  if (periodKeys.length === 0) return;

  const padding = { top: 16, right: 16, bottom: 34, left: 74 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const seriesData = periodKeys.map((key) => {
    const empMap = map.get(key) || new Map();
    if (stacked) {
      return activeEmployees.map((emp) => (empMap.get(emp.id) || { total: 0 }).total);
    }
    let sum = 0;
    empMap.forEach((v) => (sum += v.total));
    return [sum];
  });

  const maxVal = Math.max(1, ...seriesData.map((arr) => arr.reduce((a, b) => a + b, 0)));

  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartH);
  ctx.lineTo(padding.left + chartW, padding.top + chartH);
  ctx.stroke();

  const ySteps = 4;
  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = "11px " + SANS;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= ySteps; i++) {
    const v = (maxVal / ySteps) * i;
    const y = padding.top + chartH - (chartH * i) / ySteps;
    ctx.fillStyle = COLORS.inkSoft;
    ctx.fillText(Math.round(v).toLocaleString("ja-JP"), padding.left - 8, y);
    ctx.strokeStyle = "rgba(91,100,89,0.15)";
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();
  }

  const n = periodKeys.length;
  const slot = chartW / n;
  const barWidth = Math.min(44, slot * 0.6);

  periodKeys.forEach((key, i) => {
    const cx = padding.left + slot * i + slot / 2;
    let yCursor = padding.top + chartH;
    const values = seriesData[i];
    const colors = stacked
      ? activeEmployees.map((e) => payrollEmployeeColor(e.id, employees))
      : [PAYROLL_EMPLOYEE_COLORS[0]];
    values.forEach((val, vi) => {
      const barH = (val / maxVal) * chartH;
      ctx.fillStyle = colors[vi] || COLORS.teal;
      ctx.fillRect(cx - barWidth / 2, yCursor - barH, barWidth, barH);
      yCursor -= barH;
    });

    ctx.fillStyle = COLORS.inkSoft;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "11px " + SANS;
    ctx.fillText(key, cx, padding.top + chartH + 8);
  });
}

function AggregationChart({ periodKeys, map, activeEmployees, employees, stacked }) {
  const isNarrow = useMediaQuery("(max-width: 720px)");
  const canvasRef = useRef(null);
  const width = isNarrow ? 560 : 860;
  const height = 260;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawPayrollChart(canvas, { periodKeys, map, activeEmployees, employees, stacked, width, height });
  }, [periodKeys, map, activeEmployees, employees, stacked, width, height]);

  return (
    <div style={{ overflowX: "auto", marginBottom: 8 }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ display: "block" }} />
    </div>
  );
}

function AggregationTable({ periodKeys, map, activeEmployees, scope }) {
  const multi = scope === "all" && activeEmployees.length > 1;

  if (multi) {
    const cols = `120px repeat(${activeEmployees.length}, minmax(90px, 1fr)) 110px`;
    return (
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 120 + activeEmployees.length * 100 + 110 }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: 4, padding: "8px 10px", borderBottom: `1px solid ${COLORS.line}`, fontSize: 11.5, color: COLORS.inkSoft, fontWeight: 700 }}>
            <div>期間</div>
            {activeEmployees.map((emp) => <div key={emp.id} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name}</div>)}
            <div>合計</div>
          </div>
          {periodKeys.map((key) => {
            const empMap = map.get(key) || new Map();
            let sum = 0;
            return (
              <div key={key} style={{ display: "grid", gridTemplateColumns: cols, gap: 4, padding: "8px 10px", borderBottom: `1px dashed ${COLORS.line}`, fontSize: 12.5, fontFamily: MONO, alignItems: "center" }}>
                <div style={{ fontFamily: SANS, color: COLORS.ink }}>{key}</div>
                {activeEmployees.map((emp) => {
                  const v = empMap.get(emp.id) || { total: 0 };
                  sum += v.total;
                  return <div key={emp.id}>{formatYen(v.total)}</div>;
                })}
                <div style={{ fontWeight: 700, color: COLORS.teal }}>{formatYen(sum)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {periodKeys.map((key) => {
        const empMap = map.get(key) || new Map();
        let hoursSum = 0, totalSum = 0;
        empMap.forEach((v) => { hoursSum += v.hours; totalSum += v.total; });
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "10px 14px" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink }}>{key}</span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: COLORS.inkSoft }}>{formatHours(hoursSum)}</span>
            <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: COLORS.teal }}>{formatYen(totalSum)}</span>
          </div>
        );
      })}
    </div>
  );
}

function AggregationPanel({ employees, shifts, rankBonusRates }) {
  const [period, setPeriod] = useState("monthly"); // monthly | yearly
  const [scope, setScope] = useState("all"); // individual | all
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || "");

  useEffect(() => {
    if (!employees.some((e) => e.id === selectedEmployeeId)) {
      setSelectedEmployeeId(employees[0]?.id || "");
    }
  }, [employees]);

  const relevantShifts = scope === "individual" ? shifts.filter((s) => s.employeeId === selectedEmployeeId) : shifts;

  const map = new Map(); // periodKey -> employeeId -> {hours, total}
  relevantShifts.forEach((shift) => {
    const key = payrollPeriodKey(shift.date, period);
    const { hours, total } = payrollShiftTotal(shift, employees, rankBonusRates);
    if (!map.has(key)) map.set(key, new Map());
    const empMap = map.get(key);
    const cur = empMap.get(shift.employeeId) || { hours: 0, total: 0 };
    cur.hours += hours;
    cur.total += total;
    empMap.set(shift.employeeId, cur);
  });

  let periodKeys = Array.from(map.keys()).sort();
  if (period === "monthly" && periodKeys.length > 12) periodKeys = periodKeys.slice(-12);

  const activeEmployees =
    scope === "all"
      ? employees.filter((emp) => relevantShifts.some((s) => s.employeeId === emp.id))
      : employees.filter((emp) => emp.id === selectedEmployeeId);

  const stacked = scope === "all" && activeEmployees.length > 1;
  const isEmpty = relevantShifts.length === 0 || employees.length === 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setPeriod("monthly")} style={payrollPillStyle(period === "monthly")}>月次</button>
          <button onClick={() => setPeriod("yearly")} style={payrollPillStyle(period === "yearly")}>年次</button>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setScope("individual")} style={payrollPillStyle(scope === "individual")}>個別</button>
          <button onClick={() => setScope("all")} style={payrollPillStyle(scope === "all")}>全員合計</button>
        </div>
        {scope === "individual" && employees.length > 0 && (
          <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} style={payrollSelectStyle}>
            {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
        )}
      </div>

      {isEmpty ? (
        <div style={{ color: COLORS.inkSoft, fontSize: 13, padding: "40px 0", textAlign: "center" }}>
          集計するデータがありません。
        </div>
      ) : (
        <>
          <AggregationChart periodKeys={periodKeys} map={map} activeEmployees={activeEmployees} employees={employees} stacked={stacked} />
          {stacked && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, margin: "10px 0 16px" }}>
              {activeEmployees.map((emp) => (
                <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: payrollEmployeeColor(emp.id, employees), display: "inline-block" }} />
                  {emp.name}
                </div>
              ))}
            </div>
          )}
          <AggregationTable periodKeys={periodKeys} map={map} activeEmployees={activeEmployees} scope={scope} />
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   アルバイト管理画面(トップレベル)
--------------------------------------------------------- */
const PAYROLL_TABS = [
  { id: "entry", label: "勤怠入力" },
  { id: "list", label: "勤怠一覧" },
  { id: "agg", label: "集計" },
];

function PayrollScreen({ payroll, salesHistory, onUpdatePayroll, onOpenSettings, activeHomeTab, onSelectHomeTab, showToast }) {
  const [tab, setTab] = useState(PAYROLL_TABS[0].id);
  const [editingShiftId, setEditingShiftId] = useState(null);

  const employees = payroll.employees;
  const shifts = payroll.shifts;
  const rankBonusRates = payroll.rankBonusRates;

  const saveShift = (shift) => {
    const isUpdate = !!shift.id;
    const list = isUpdate ? shifts.map((s) => (s.id === shift.id ? shift : s)) : [...shifts, { ...shift, id: uid("shift") }];
    onUpdatePayroll({ shifts: list });
    setEditingShiftId(null);
    showToast(isUpdate ? "更新しました" : "追加しました");
  };

  const deleteShift = (id) => {
    onUpdatePayroll({ shifts: shifts.filter((s) => s.id !== id) });
  };

  const togglePaidDate = (id) => {
    let nowPaid = false;
    const list = shifts.map((s) => {
      if (s.id !== id) return s;
      nowPaid = !s.paidDate;
      return { ...s, paidDate: s.paidDate ? "" : toDateInputValue(new Date().toISOString()).replaceAll("-", "/") };
    });
    onUpdatePayroll({ shifts: list });
    showToast(nowPaid ? "支払い済みにしました" : "支払い未定に戻しました");
  };

  const editingShift = editingShiftId ? shifts.find((s) => s.id === editingShiftId) || null : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header
        title="アルバイト管理"
        right={<HeaderIconButton icon={Settings} onClick={onOpenSettings} title="マスタ設定" />}
      />

      <HomeTabBar active={activeHomeTab} onSelect={onSelectHomeTab} />

      <div style={{ display: "flex", gap: 6, padding: "12px 20px", borderBottom: `1px solid ${COLORS.line}`, background: COLORS.paper, overflowX: "auto" }}>
        {PAYROLL_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={payrollPillStyle(tab === t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: 20, maxWidth: (tab === "list" || tab === "agg") ? "none" : 640, margin: "0 auto", width: "100%" }}>
        {tab === "entry" && (
          <ShiftEntryPanel
            employees={employees}
            shifts={shifts}
            editingShift={editingShift}
            onSave={saveShift}
            onCancelEdit={() => { setEditingShiftId(null); setTab("list"); }}
          />
        )}
        {tab === "list" && (
          <ShiftListPanel
            employees={employees}
            shifts={shifts}
            rankBonusRates={rankBonusRates}
            salesHistory={salesHistory}
            onEdit={(id) => { setEditingShiftId(id); setTab("entry"); }}
            onDelete={deleteShift}
            onTogglePaid={togglePaidDate}
          />
        )}
        {tab === "agg" && <AggregationPanel employees={employees} shifts={shifts} rankBonusRates={rankBonusRates} />}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   マウント
--------------------------------------------------------- */
const rootEl = document.getElementById("root");
const root = ReactDOM.createRoot(rootEl);
root.render(React.createElement(App));
