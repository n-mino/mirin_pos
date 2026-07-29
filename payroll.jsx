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

function payrollShiftTotal(shift, employees) {
  const emp = employees.find((e) => e.id === shift.employeeId);
  const wage = emp ? emp.hourlyWage : 0;
  const minutes = payrollShiftMinutes(shift.startTime, shift.endTime);
  const hours = minutes === null ? 0 : minutes / 60;
  const dailyWage = shift.dailyWage || 0;
  const base = dailyWage > 0 ? dailyWage : hours * wage;
  return { hours, total: base + (shift.option || 0) + (shift.option2 || 0) };
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

/* ---------------------------------------------------------
   勤怠入力
--------------------------------------------------------- */
function ShiftEntryPanel({ employees, editingShift, onSave, onCancelEdit }) {
  const blank = () => ({
    employeeId: employees[0]?.id || "",
    date: toDateInputValue(new Date().toISOString()),
    startTime: "",
    endTime: "",
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
    setError("");
    onSave({
      id: editingShift?.id,
      employeeId: form.employeeId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
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
          先に「アルバイトマスタ」タブでスタッフを登録してください。
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
              <label style={{ fontSize: 12, color: COLORS.inkSoft }}>開始時刻</label>
              <input type="time" step={900} value={form.startTime} onChange={(e) => setField("startTime", e.target.value)} style={{ ...payrollFieldInputStyle, fontFamily: MONO }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: COLORS.inkSoft }}>終了時刻</label>
              <input type="time" step={900} value={form.endTime} onChange={(e) => setField("endTime", e.target.value)} style={{ ...payrollFieldInputStyle, fontFamily: MONO }} />
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
              <label style={{ fontSize: 12, color: COLORS.inkSoft }}>オプション金額１(円)</label>
              <input type="number" min="0" value={form.option} onChange={(e) => setField("option", e.target.value)} style={{ ...payrollFieldInputStyle, fontFamily: MONO }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: COLORS.inkSoft }}>オプション金額２(円)</label>
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
const SHIFT_TABLE_COLS = "90px 100px 110px 70px 80px 80px 80px 90px 140px 70px";

function ShiftListPanel({ employees, shifts, onEdit, onDelete }) {
  const [viewMode, setViewMode] = useState("all"); // individual | all
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || "");
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
  list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setViewMode("individual")} style={payrollPillStyle(viewMode === "individual")}>個別</button>
          <button onClick={() => setViewMode("all")} style={payrollPillStyle(viewMode === "all")}>全員一括</button>
        </div>
        {viewMode === "individual" && employees.length > 0 && (
          <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} style={payrollSelectStyle}>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        )}
      </div>

      {list.length === 0 ? (
        <div style={{ color: COLORS.inkSoft, fontSize: 13, padding: "20px 0", textAlign: "center" }}>
          勤怠記録がまだありません。
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 910 }}>
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
              <div>日付</div>
              <div>従業員</div>
              <div>時間</div>
              <div>勤務時間</div>
              <div>日給</div>
              <div>オプション１</div>
              <div>オプション２</div>
              <div>合計</div>
              <div>メモ</div>
              <div>操作</div>
            </div>
            {list.map((shift) => {
              const emp = employees.find((e) => e.id === shift.employeeId);
              const { hours, total } = payrollShiftTotal(shift, employees);
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
                  <div style={{ fontFamily: SANS, color: COLORS.ink }}>{shift.date}</div>
                  <div style={{ fontFamily: SANS, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {emp ? emp.name : "(削除済み)"}
                  </div>
                  <div>{shift.startTime}-{shift.endTime}</div>
                  <div>{formatHours(hours)}</div>
                  <div>{shift.dailyWage > 0 ? formatYen(shift.dailyWage) : "-"}</div>
                  <div>{shift.option > 0 ? formatYen(shift.option) : "-"}</div>
                  <div>{shift.option2 > 0 ? formatYen(shift.option2) : "-"}</div>
                  <div style={{ fontWeight: 700, color: COLORS.teal }}>{formatYen(total)}</div>
                  <div style={{ fontFamily: SANS, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {shift.note || ""}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => onEdit(shift.id)} style={{ ...payrollIconBtnStyle, width: 26, height: 26 }}>
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => setDeletingShiftId(shift.id)} style={{ ...payrollIconBtnStyle, width: 26, height: 26, border: `1px solid ${COLORS.brick}`, color: COLORS.brick }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

function AggregationPanel({ employees, shifts }) {
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
    const { hours, total } = payrollShiftTotal(shift, employees);
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
  { id: "employees", label: "アルバイトマスタ" },
];

function PayrollScreen({ payroll, onUpdatePayroll, onOpenSettings, activeHomeTab, onSelectHomeTab }) {
  const [tab, setTab] = useState(PAYROLL_TABS[0].id);
  const [editingEmployee, setEditingEmployee] = useState(null); // null | {} | employee
  const [deletingEmployeeId, setDeletingEmployeeId] = useState(null);
  const [editingShiftId, setEditingShiftId] = useState(null);

  const employees = payroll.employees;
  const shifts = payroll.shifts;

  const saveEmployee = (emp) => {
    const list = emp.id ? employees.map((e) => (e.id === emp.id ? emp : e)) : [...employees, { ...emp, id: uid("emp") }];
    onUpdatePayroll({ employees: list });
    setEditingEmployee(null);
  };

  const deleteEmployee = (id) => {
    onUpdatePayroll({
      employees: employees.filter((e) => e.id !== id),
      shifts: shifts.filter((s) => s.employeeId !== id),
    });
    setDeletingEmployeeId(null);
  };

  const saveShift = (shift) => {
    const list = shift.id ? shifts.map((s) => (s.id === shift.id ? shift : s)) : [...shifts, { ...shift, id: uid("shift") }];
    onUpdatePayroll({ shifts: list });
    setEditingShiftId(null);
  };

  const deleteShift = (id) => {
    onUpdatePayroll({ shifts: shifts.filter((s) => s.id !== id) });
  };

  const editingShift = editingShiftId ? shifts.find((s) => s.id === editingShiftId) || null : null;
  const deletingEmployee = deletingEmployeeId ? employees.find((e) => e.id === deletingEmployeeId) : null;

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

      <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: 20, maxWidth: tab === "list" ? "none" : 640, margin: "0 auto", width: "100%" }}>
        {tab === "employees" && (
          <EmployeeListPanel
            employees={employees}
            onAdd={() => setEditingEmployee({})}
            onEdit={(emp) => setEditingEmployee(emp)}
            onDelete={(id) => setDeletingEmployeeId(id)}
          />
        )}
        {tab === "entry" && (
          <ShiftEntryPanel
            employees={employees}
            editingShift={editingShift}
            onSave={saveShift}
            onCancelEdit={() => { setEditingShiftId(null); setTab("list"); }}
          />
        )}
        {tab === "list" && (
          <ShiftListPanel
            employees={employees}
            shifts={shifts}
            onEdit={(id) => { setEditingShiftId(id); setTab("entry"); }}
            onDelete={deleteShift}
          />
        )}
        {tab === "agg" && <AggregationPanel employees={employees} shifts={shifts} />}
      </div>

      {editingEmployee !== null && (
        <EmployeeEditModal
          employee={editingEmployee}
          onCancel={() => setEditingEmployee(null)}
          onSave={saveEmployee}
        />
      )}

      {deletingEmployee && (
        <ConfirmModal
          title="アルバイトを削除しますか？"
          message={
            shifts.some((s) => s.employeeId === deletingEmployee.id)
              ? `${deletingEmployee.name} を削除すると、紐づく勤怠記録も削除されます。この操作は元に戻せません。`
              : `${deletingEmployee.name} を削除します。よろしいですか？`
          }
          confirmLabel="削除する"
          onCancel={() => setDeletingEmployeeId(null)}
          onConfirm={() => deleteEmployee(deletingEmployee.id)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   マウント
--------------------------------------------------------- */
const rootEl = document.getElementById("root");
const root = ReactDOM.createRoot(rootEl);
root.render(React.createElement(App));
