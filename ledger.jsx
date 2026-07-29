/* ---------------------------------------------------------
   売上管理(入出金入力・日次集計)

   app.jsx で定義されたグローバル(COLORS/MONO/DISPLAY/SANS/
   各アイコン/TicketButton/Header/HeaderIconButton/HomeTabBar/
   formatYen/uid/toDateInputValue/isSameDate/formatTimeShort/
   seatDisplayLabel/useMediaQuery/React hooks)をそのまま再利用する。
   「日次集計」タブは人件費の算出にpayroll.jsxのpayrollShiftTotal
   関数も参照するが、実際に呼び出されるのはコンポーネントの
   レンダー時(=全スクリプト読み込み完了後)のため、
   payroll.jsxがこのファイルより後に読み込まれる現在の順序でも問題ない
   (関数宣言の巻き上げにより、呼び出し時点で定義済みであればよい)。

   ビルドツールを使わない構成のため、このファイルは index.html 内で
   app.jsx より後・payroll.jsx より前に <script type="text/babel">
   で読み込むこと(payroll.jsx末尾でReactDOM.createRoot().render()が
   呼ばれるため、それより前に本ファイルの評価を終えておく必要がある)。

   ファイル名について: 当初 cashflow.jsx としていたが、動作確認用の
   ブラウザ環境で"cash"を含むファイル名がブロックリストに引っかかり
   net::ERR_BLOCKED_BY_CLIENTで読み込みがブロックされたため、
   ledger.jsx にリネームして回避した経緯がある。
--------------------------------------------------------- */

function cashFlowBlankRows(n) {
  return Array.from({ length: n }, () => ({ id: uid("cf"), memo: "", amount: "" }));
}

function cashFlowTotal(rows) {
  return rows.reduce((sum, r) => sum + Math.max(0, Number(r.amount) || 0), 0);
}

function salesTabPillStyle(active) {
  return {
    padding: "8px 16px",
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

/* ---------------------------------------------------------
   入出金入力
--------------------------------------------------------- */
function CashFlowColumn({ title, rows, onChange }) {
  const updateRow = (id, patch) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const addRow = () => onChange([...rows, ...cashFlowBlankRows(1)]);
  const removeRow = (id) => onChange(rows.filter((r) => r.id !== id));
  const total = cashFlowTotal(rows);

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: COLORS.ink, textAlign: "center", marginBottom: 14 }}>
        {title}
      </div>

      <TicketButton variant="primary" onClick={addRow} icon={Plus} style={{ marginBottom: 14 }}>
        項目追加
      </TicketButton>

      <div style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: COLORS.inkSoft, fontWeight: 700 }}>
        <div style={{ flex: 2 }}>摘要</div>
        <div style={{ flex: 1 }}>金額</div>
        <div style={{ width: 30, flexShrink: 0 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {rows.map((row) => (
          <div key={row.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={row.memo}
              onChange={(e) => updateRow(row.id, { memo: e.target.value })}
              style={{
                flex: 2,
                minWidth: 0,
                padding: "9px 10px",
                borderRadius: 6,
                border: `1.5px solid ${COLORS.line}`,
                fontSize: 14,
                background: COLORS.paper,
                color: COLORS.ink,
              }}
            />
            <input
              type="number"
              min="0"
              value={row.amount}
              onChange={(e) => updateRow(row.id, { amount: e.target.value })}
              placeholder="0"
              style={{
                flex: 1,
                minWidth: 0,
                padding: "9px 10px",
                borderRadius: 6,
                border: `1.5px solid ${COLORS.line}`,
                fontFamily: MONO,
                fontSize: 14,
                background: COLORS.paper,
                color: COLORS.ink,
              }}
            />
            <button
              onClick={() => removeRow(row.id)}
              style={{
                width: 30,
                height: 30,
                flexShrink: 0,
                borderRadius: 6,
                border: `1px solid ${COLORS.brick}`,
                background: "transparent",
                color: COLORS.brick,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `1px solid ${COLORS.line}`, paddingTop: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink }}>合計</span>
        <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: COLORS.teal }}>{formatYen(total)}</span>
      </div>
    </div>
  );
}

function CashFlowEntryPanel({ cashFlow, onUpdateCashFlow }) {
  const [dateValue, setDateValue] = useState(toDateInputValue(new Date().toISOString()));
  const isNarrow = useMediaQuery("(max-width: 720px)");

  // 未入力日の空テンプレートはdateValueが変わるまで同一インスタンスを保つ
  // (毎レンダーで新規生成すると、30秒毎のタイマー更新等でidが振り直され
  // 入力途中の空行がフォーカスを失ってしまうため)
  const blankRecord = React.useMemo(
    () => ({ expenses: cashFlowBlankRows(3), income: cashFlowBlankRows(3) }),
    [dateValue]
  );
  const record = cashFlow.records[dateValue] || blankRecord;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        <CalendarDays size={14} color={COLORS.inkSoft} />
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          style={{
            border: `1.5px solid ${COLORS.line}`,
            borderRadius: 6,
            padding: "6px 10px",
            background: "transparent",
            fontFamily: MONO,
            fontSize: 13,
            color: COLORS.ink,
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: isNarrow ? "column" : "row", gap: 28, maxWidth: 900, margin: "0 auto" }}>
        <CashFlowColumn
          title="出金"
          rows={record.expenses}
          onChange={(rows) => onUpdateCashFlow(dateValue, { ...record, expenses: rows })}
        />
        <CashFlowColumn
          title="入金"
          rows={record.income}
          onChange={(rows) => onUpdateCashFlow(dateValue, { ...record, income: rows })}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   日次集計
--------------------------------------------------------- */
function DailySummaryListBox({ children, isEmpty }) {
  return (
    <div style={{ border: `1.5px solid ${COLORS.line}`, borderRadius: 10, background: COLORS.paper, maxHeight: 240, overflowY: "auto" }}>
      {isEmpty ? (
        <div style={{ padding: 20, textAlign: "center", fontSize: 12.5, color: COLORS.inkSoft }}>データがありません</div>
      ) : (
        children
      )}
    </div>
  );
}

function DailySummaryRow({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: `1px dashed ${COLORS.line}`, fontSize: 12.5 }}>
      {children}
    </div>
  );
}

function CashFlowSummaryTable({ rows }) {
  const total = cashFlowTotal(rows);
  const filled = rows.filter((r) => r.memo.trim() || Number(r.amount) > 0);

  return (
    <div style={{ border: `1.5px solid ${COLORS.line}`, borderRadius: 10, background: COLORS.paper }}>
      <DailySummaryListBox isEmpty={filled.length === 0}>
        {filled.map((row) => (
          <DailySummaryRow key={row.id}>
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: COLORS.ink }}>
              {row.memo.trim() || "(名称未設定)"}
            </span>
            <span style={{ fontFamily: MONO, color: COLORS.ink }}>{formatYen(Math.max(0, Number(row.amount) || 0))}</span>
          </DailySummaryRow>
        ))}
      </DailySummaryListBox>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", fontSize: 13, fontWeight: 700 }}>
        <span style={{ color: COLORS.ink }}>合計</span>
        <span style={{ fontFamily: MONO, color: COLORS.teal }}>{formatYen(total)}</span>
      </div>
    </div>
  );
}

function DailySummaryPanel({ data }) {
  const isNarrow = useMediaQuery("(max-width: 900px)");
  const [mode, setMode] = useState("today"); // today | date
  const [dateValue, setDateValue] = useState(toDateInputValue(new Date().toISOString()));
  const targetDate = mode === "today" ? toDateInputValue(new Date().toISOString()) : dateValue;

  const sales = data.salesHistory
    .filter((s) => isSameDate(s.endTime, targetDate))
    .sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
  const employees = data.payroll.employees;
  const shifts = data.payroll.shifts.filter((s) => s.date === targetDate);
  const record = data.cashFlow.records[targetDate] || { expenses: [], income: [] };

  const cash = sales.reduce((sum, s) => sum + (s.payments?.cash || 0), 0);
  const card = sales.reduce((sum, s) => sum + (s.payments?.card || 0), 0);
  const paypay = sales.reduce((sum, s) => sum + (s.payments?.paypay || 0), 0);
  const onAccount = sales.reduce((sum, s) => sum + (s.payments?.onAccount || 0), 0);
  const totalSales = cash + card + paypay + onAccount;
  const laborCost = shifts.reduce((sum, s) => sum + payrollShiftTotal(s, employees).total, 0);
  const expensesTotal = cashFlowTotal(record.expenses);
  const incomeTotal = cashFlowTotal(record.income);
  const remaining = cash - laborCost - expensesTotal + incomeTotal;

  const summaryRows = [
    { label: "総売上", value: totalSales, highlight: true },
    { label: "現金", value: cash },
    { label: "カード", value: card },
    { label: "PayPay", value: paypay },
    { label: "売掛", value: onAccount },
    { label: "人件費", value: laborCost },
    { label: "出金", value: expensesTotal },
    { label: "入金", value: incomeTotal },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <button onClick={() => setMode("today")} style={salesTabPillStyle(mode === "today")}>本日のみ</button>
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

      <div style={{ display: "flex", flexDirection: isNarrow ? "column" : "row", gap: 20 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 8 }}>売上履歴</div>
            <DailySummaryListBox isEmpty={sales.length === 0}>
              {sales.map((s) => (
                <DailySummaryRow key={s.id}>
                  <span style={{ fontFamily: MONO, color: COLORS.inkSoft, flexShrink: 0 }}>{formatTimeShort(s.endTime)}</span>
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: COLORS.ink }}>
                    {seatDisplayLabel(s.seatId, s.seatName)}
                  </span>
                  <span style={{ fontFamily: MONO, fontWeight: 700, color: COLORS.teal, flexShrink: 0 }}>{formatYen(s.total)}</span>
                </DailySummaryRow>
              ))}
            </DailySummaryListBox>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 8 }}>勤怠一覧</div>
            <DailySummaryListBox isEmpty={shifts.length === 0}>
              {shifts.map((shift) => {
                const emp = employees.find((e) => e.id === shift.employeeId);
                const { total } = payrollShiftTotal(shift, employees);
                return (
                  <DailySummaryRow key={shift.id}>
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: COLORS.ink }}>
                      {emp ? emp.name : "(削除済み)"}
                    </span>
                    <span style={{ fontFamily: MONO, color: COLORS.inkSoft, flexShrink: 0 }}>{shift.startTime}-{shift.endTime}</span>
                    <span style={{ fontFamily: MONO, fontWeight: 700, color: COLORS.teal, flexShrink: 0 }}>{formatYen(total)}</span>
                  </DailySummaryRow>
                );
              })}
            </DailySummaryListBox>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ border: `1.5px solid ${COLORS.line}`, borderRadius: 10, background: COLORS.paper, padding: 16 }}>
            {summaryRows.map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: `1px dashed ${COLORS.line}`,
                  fontSize: row.highlight ? 14 : 13,
                  color: row.highlight ? COLORS.ink : COLORS.inkSoft,
                  fontWeight: row.highlight ? 700 : 400,
                }}
              >
                <span>{row.label}</span>
                <span style={{ fontFamily: MONO, color: row.highlight ? COLORS.teal : COLORS.ink, fontWeight: row.highlight ? 700 : 400 }}>
                  {formatYen(row.value)}
                </span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink }}>残金</span>
              <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: remaining < 0 ? COLORS.brick : COLORS.teal }}>
                {remaining < 0 ? "-" : ""}{formatYen(Math.abs(remaining))}
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 8 }}>出金</div>
            <CashFlowSummaryTable rows={record.expenses} />
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 8 }}>入金</div>
            <CashFlowSummaryTable rows={record.income} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   売上管理画面(トップレベル)
--------------------------------------------------------- */
const SALES_MANAGEMENT_TABS = [
  { id: "entry", label: "入出金入力" },
  { id: "daily", label: "日次集計" },
];

function SalesManagementScreen({ data, onUpdateCashFlow, onOpenSettings, activeHomeTab, onSelectHomeTab }) {
  const [tab, setTab] = useState(SALES_MANAGEMENT_TABS[0].id);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header
        title="売上管理"
        right={<HeaderIconButton icon={Settings} onClick={onOpenSettings} title="マスタ設定" />}
      />

      <HomeTabBar active={activeHomeTab} onSelect={onSelectHomeTab} />

      <div style={{ display: "flex", gap: 6, padding: "12px 20px", borderBottom: `1px solid ${COLORS.line}`, background: COLORS.paper, overflowX: "auto" }}>
        {SALES_MANAGEMENT_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={salesTabPillStyle(tab === t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {tab === "entry" && <CashFlowEntryPanel cashFlow={data.cashFlow} onUpdateCashFlow={onUpdateCashFlow} />}
        {tab === "daily" && <DailySummaryPanel data={data} />}
      </div>
    </div>
  );
}
