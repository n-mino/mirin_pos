/* ---------------------------------------------------------
   入出金管理

   app.jsx で定義されたグローバル(COLORS/MONO/DISPLAY/SANS/
   各アイコン/TicketButton/Header/HeaderIconButton/HomeTabBar/
   formatYen/uid/toDateInputValue/useMediaQuery/React hooks)を
   そのまま再利用する。ビルドツールを使わない構成のため、この
   ファイルは index.html 内で app.jsx より後・payroll.jsx より
   前に <script type="text/babel"> で読み込むこと
   (payroll.jsx末尾でReactDOM.createRoot().render()が呼ばれる
   ため、それより前に本ファイルの評価を終えておく必要がある)。
--------------------------------------------------------- */

function cashFlowBlankRows(n) {
  return Array.from({ length: n }, () => ({ id: uid("cf"), memo: "", amount: "" }));
}

function cashFlowTotal(rows) {
  return rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
}

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

function CashFlowScreen({ cashFlow, onUpdateCashFlow, onOpenSettings, activeHomeTab, onSelectHomeTab }) {
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header
        title="入出金管理"
        right={<HeaderIconButton icon={Settings} onClick={onOpenSettings} title="マスタ設定" />}
      />

      <HomeTabBar active={activeHomeTab} onSelect={onSelectHomeTab} />

      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          borderBottom: `1px solid ${COLORS.line}`,
          background: COLORS.paper,
        }}
      >
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

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
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
    </div>
  );
}
