/* ---------------------------------------------------------
   売上管理(入出金入力・日次集計)

   app.jsx で定義されたグローバル(COLORS/MONO/DISPLAY/SANS/
   各アイコン/TicketButton/Header/HeaderIconButton/HomeTabBar/
   formatYen/uid/toDateInputValue/isSameDate/formatDateTimeRange/
   seatDisplayLabel/useMediaQuery/React hooks)をそのまま再利用する。
   「日次集計」タブの売上履歴・勤怠一覧は、それぞれ本ファイルの
   SalesHistoryPanel・payroll.jsxのShiftListPanelと同じ列構成
   (HISTORY_TABLE_COLS/SHIFT_TABLE_COLS、および formatHours/
   payrollShiftTotal)を再利用して表示内容を完全に一致させている。
   payroll.jsxはこのファイルより後に読み込まれるが、SHIFT_TABLE_COLSや
   payrollShiftTotal等の参照は実際にはコンポーネントのレンダー時
   (=全スクリプト読み込み完了後)に評価されるため問題ない
   (関数宣言・topレベルconstの評価順序上、呼び出し時点で定義済みであればよい)。

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

function DailySalesTable({ sales }) {
  if (sales.length === 0) {
    return <div style={{ color: COLORS.inkSoft, fontSize: 13, padding: "16px 0", textAlign: "center" }}>該当する会計データがありません</div>;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 1290 }}>
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
          <div>同伴</div>
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
        {sales.map((s) => (
          <div
            key={s.id}
            style={{
              display: "grid",
              gridTemplateColumns: HISTORY_TABLE_COLS,
              gap: 4,
              padding: "8px 10px",
              borderBottom: `1px dashed ${COLORS.line}`,
              fontSize: 12.5,
              fontFamily: MONO,
              alignItems: "center",
            }}
          >
            <div style={{ fontFamily: SANS, color: COLORS.ink }}>{formatDateTimeRange(s.startTime, s.endTime)}</div>
            <div style={{ fontFamily: SANS, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {seatDisplayLabel(s.seatId, s.seatName)}
            </div>
            <div>{s.guests}名</div>
            <div>{s.companion ? "○" : ""}</div>
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
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyShiftTable({ shifts, employees }) {
  if (shifts.length === 0) {
    return <div style={{ color: COLORS.inkSoft, fontSize: 13, padding: "16px 0", textAlign: "center" }}>勤怠記録がまだありません。</div>;
  }
  // 勤怠一覧(SHIFT_TABLE_COLS)から末尾の「操作」列(編集・削除ボタン)を除いた列幅。
  // 日次集計は閲覧専用のため編集操作は持たせない(編集は勤怠入力/一覧画面で行う)。
  // SHIFT_TABLE_COLSはpayroll.jsx側のグローバルで、このファイルより後に
  // 読み込まれるため、モジュールのトップレベルではなくレンダー時(関数内)で
  // 参照すること(トップレベルで参照すると読み込み順序の関係でエラーになる)。
  const dailyShiftTableCols = SHIFT_TABLE_COLS.split(" ").slice(0, -1).join(" ");
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 920 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: dailyShiftTableCols,
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
          <div>時給</div>
          <div>日給</div>
          <div>オプション１</div>
          <div>オプション２</div>
          <div>合計</div>
          <div>メモ</div>
        </div>
        {shifts.map((shift) => {
          const emp = employees.find((e) => e.id === shift.employeeId);
          const { hours, total } = payrollShiftTotal(shift, employees);
          return (
            <div
              key={shift.id}
              style={{
                display: "grid",
                gridTemplateColumns: dailyShiftTableCols,
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
              <div>{emp ? formatYen(emp.hourlyWage) : "-"}</div>
              <div>{shift.dailyWage > 0 ? formatYen(shift.dailyWage) : "-"}</div>
              <div>{shift.option > 0 ? formatYen(shift.option) : "-"}</div>
              <div>{shift.option2 > 0 ? formatYen(shift.option2) : "-"}</div>
              <div style={{ fontWeight: 700, color: COLORS.teal }}>{formatYen(total)}</div>
              <div style={{ fontFamily: SANS, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {shift.note || ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 印刷用HTML組み立て時のエスケープ(ユーザー入力のメモ等をそのまま埋め込まないため)
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// 日次集計を印刷用の別ウィンドウで開き、ブラウザの印刷機能(→PDFとして保存)を呼び出す。
// 現在の画面(flex/overflow:autoの入れ子レイアウト)をそのまま印刷すると
// スクロール領域からはみ出た部分が切れてしまうため、印刷専用の単純なHTMLを
// 新しいウィンドウに組み立てて印刷する方式にしている。
function printDailySummary({ targetDate, summaryRows, remaining, expenses, income, sales, shifts, employees }) {
  const style = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', sans-serif; color: #20291F; padding: 24px; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    h2 { font-size: 13px; margin: 22px 0 8px; border-bottom: 2px solid #1D4E4B; padding-bottom: 4px; }
    .sub { font-size: 12px; color: #5B6459; margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border-bottom: 1px solid #DCD4C4; padding: 5px 6px; text-align: left; }
    th { color: #5B6459; font-weight: 700; }
    .num { text-align: right; }
    tr.highlight td { font-weight: 700; }
    .remaining { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1.5px solid #20291F; }
    .cols { display: flex; gap: 24px; }
    .cols > div { flex: 1; min-width: 0; }
    .no-print { margin-bottom: 18px; }
    .no-print button {
      font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', sans-serif;
      font-size: 13px; font-weight: 700; color: #1D4E4B; background: #E4EEE3;
      border: 1.5px solid #1D4E4B; border-radius: 8px; padding: 10px 16px; cursor: pointer;
    }
    @media print { body { padding: 8px; } .no-print { display: none; } }
  `;

  const summaryRowsHtml = summaryRows.map((r) => `
    <tr class="${r.highlight ? "highlight" : ""}">
      <td>${escapeHtml(r.label)}</td>
      <td class="num">${escapeHtml(formatYen(r.value))}</td>
    </tr>
  `).join("");

  const cashFlowRowsHtml = (rows) => {
    const filled = rows.filter((r) => r.memo.trim() || Number(r.amount) > 0);
    if (filled.length === 0) {
      return `<tr><td colspan="2" class="num" style="text-align:center;color:#5B6459">なし</td></tr>`;
    }
    return filled.map((r) => `
      <tr>
        <td>${escapeHtml(r.memo.trim() || "(名称未設定)")}</td>
        <td class="num">${escapeHtml(formatYen(Math.max(0, Number(r.amount) || 0)))}</td>
      </tr>
    `).join("");
  };

  const salesRowsHtml = sales.length === 0
    ? `<tr><td colspan="13" style="text-align:center;color:#5B6459">該当する会計データがありません</td></tr>`
    : sales.map((s) => `
      <tr>
        <td>${escapeHtml(formatDateTimeRange(s.startTime, s.endTime))}</td>
        <td>${escapeHtml(seatDisplayLabel(s.seatId, s.seatName))}</td>
        <td class="num">${s.guests}名</td>
        <td class="num">${s.companion ? "○" : ""}</td>
        <td class="num">${escapeHtml(formatYen(s.subtotal))}</td>
        <td class="num">${escapeHtml(formatYen(s.serviceCharge))}</td>
        <td class="num">${escapeHtml(formatYen(s.tax))}</td>
        <td class="num">${escapeHtml(formatYen(s.total))}</td>
        <td class="num">${s.payments?.cash ? escapeHtml(formatYen(s.payments.cash)) : "-"}</td>
        <td class="num">${s.payments?.card ? escapeHtml(formatYen(s.payments.card)) : "-"}</td>
        <td class="num">${s.payments?.paypay ? escapeHtml(formatYen(s.payments.paypay)) : "-"}</td>
        <td class="num">${s.payments?.onAccount ? escapeHtml(formatYen(s.payments.onAccount)) : "-"}</td>
        <td>${escapeHtml(s.memo || "")}</td>
      </tr>
    `).join("");

  const shiftRowsHtml = shifts.length === 0
    ? `<tr><td colspan="10" style="text-align:center;color:#5B6459">勤怠記録がまだありません。</td></tr>`
    : shifts.map((shift) => {
      const emp = employees.find((e) => e.id === shift.employeeId);
      const { hours, total } = payrollShiftTotal(shift, employees);
      return `
        <tr>
          <td>${escapeHtml(shift.date)}</td>
          <td>${escapeHtml(emp ? emp.name : "(削除済み)")}</td>
          <td>${escapeHtml(shift.startTime)}-${escapeHtml(shift.endTime)}</td>
          <td class="num">${escapeHtml(formatHours(hours))}</td>
          <td class="num">${emp ? escapeHtml(formatYen(emp.hourlyWage)) : "-"}</td>
          <td class="num">${shift.dailyWage > 0 ? escapeHtml(formatYen(shift.dailyWage)) : "-"}</td>
          <td class="num">${shift.option > 0 ? escapeHtml(formatYen(shift.option)) : "-"}</td>
          <td class="num">${shift.option2 > 0 ? escapeHtml(formatYen(shift.option2)) : "-"}</td>
          <td class="num">${escapeHtml(formatYen(total))}</td>
          <td>${escapeHtml(shift.note || "")}</td>
        </tr>
      `;
    }).join("");

  const html = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><title>日次集計_${escapeHtml(targetDate)}</title><style>${style}</style></head>
<body>
  <div class="no-print"><button onclick="window.close()">← 閉じてPOS画面に戻る</button></div>
  <h1>日次集計</h1>
  <div class="sub">対象日: ${escapeHtml(targetDate)}</div>

  <div class="cols">
    <div>
      <h2>概要</h2>
      <table><tbody>${summaryRowsHtml}</tbody></table>
      <div class="remaining"><span>残金</span><span>${remaining < 0 ? "-" : ""}${escapeHtml(formatYen(Math.abs(remaining)))}</span></div>
    </div>
    <div>
      <h2>出金</h2>
      <table><tbody>${cashFlowRowsHtml(expenses)}</tbody></table>
    </div>
    <div>
      <h2>入金</h2>
      <table><tbody>${cashFlowRowsHtml(income)}</tbody></table>
    </div>
  </div>

  <h2>売上履歴</h2>
  <table>
    <thead><tr><th>日時</th><th>座席</th><th>人数</th><th>同伴</th><th>小計</th><th>サービス料</th><th>消費税</th><th>合計</th><th>現金</th><th>カード</th><th>PayPay</th><th>売掛</th><th>メモ</th></tr></thead>
    <tbody>${salesRowsHtml}</tbody>
  </table>

  <h2>勤怠一覧</h2>
  <table>
    <thead><tr><th>日付</th><th>従業員</th><th>時間</th><th>勤務時間</th><th>時給</th><th>日給</th><th>オプション1</th><th>オプション2</th><th>合計</th><th>メモ</th></tr></thead>
    <tbody>${shiftRowsHtml}</tbody>
  </table>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("ポップアップがブロックされました。ブラウザの設定でこのサイトのポップアップを許可してください。");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 300);
}

function DailySummaryPanel({ data }) {
  const isNarrow = useMediaQuery("(max-width: 720px)");
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
        <button
          onClick={() => printDailySummary({ targetDate, summaryRows, remaining, expenses: record.expenses, income: record.income, sales, shifts, employees })}
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
          <Printer size={14} />
          PDFで保存(印刷)
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: isNarrow ? "column" : "row", gap: 20, marginBottom: 24 }}>
        <div style={{ flex: "1.2 1 0", minWidth: 0, border: `1.5px solid ${COLORS.line}`, borderRadius: 10, background: COLORS.paper, padding: 16 }}>
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

        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, marginBottom: 10 }}>出金</div>
          <CashFlowSummaryTable rows={record.expenses} />
        </div>

        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, marginBottom: 10 }}>入金</div>
          <CashFlowSummaryTable rows={record.income} />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, marginBottom: 10 }}>売上履歴</div>
        <DailySalesTable sales={sales} />
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, marginBottom: 10 }}>勤怠一覧</div>
        <DailyShiftTable shifts={shifts} employees={employees} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   集計グラフ(日毎/月毎の支払い方法別 積み上げグラフ)
--------------------------------------------------------- */
const PAYMENT_METHOD_ORDER = ["cash", "card", "paypay", "onAccount"];
const PAYMENT_METHOD_LABELS = { cash: "現金", card: "カード", paypay: "PayPay", onAccount: "売掛" };
const PAYMENT_METHOD_COLORS = { cash: COLORS.teal, card: COLORS.sage, paypay: COLORS.amber, onAccount: COLORS.brick };

const graphDateInputStyle = {
  padding: "8px 10px",
  borderRadius: 8,
  border: `1.5px solid ${COLORS.line}`,
  fontFamily: MONO,
  fontSize: 13,
  color: COLORS.ink,
  background: "#fff",
};

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toDateInputValue(d);
}

function daysBetween(fromDate, toDate) {
  const a = new Date(fromDate + "T00:00:00");
  const b = new Date(toDate + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

function currentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(monthStr, n) {
  const [y, m] = monthStr.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;
  return `${ny}-${String(nm + 1).padStart(2, "0")}`;
}

function monthDiff(fromMonth, toMonth) {
  const [ay, am] = fromMonth.split("-").map(Number);
  const [by, bm] = toMonth.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}

function emptyPaymentTotals() {
  return { cash: 0, card: 0, paypay: 0, onAccount: 0, guests: 0 };
}

function aggregateSalesByDay(salesHistory, fromDate, toDate) {
  const totals = new Map();
  salesHistory.forEach((s) => {
    const key = toDateInputValue(s.endTime);
    if (key < fromDate || key > toDate) return;
    const cur = totals.get(key) || emptyPaymentTotals();
    cur.cash += s.payments?.cash || 0;
    cur.card += s.payments?.card || 0;
    cur.paypay += s.payments?.paypay || 0;
    cur.onAccount += s.payments?.onAccount || 0;
    cur.guests += s.guests || 0;
    totals.set(key, cur);
  });
  const points = [];
  for (let key = fromDate; key <= toDate; key = addDays(key, 1)) {
    points.push({ key, label: key.slice(5).replace("-", "/"), ...(totals.get(key) || emptyPaymentTotals()) });
  }
  return points;
}

function aggregateSalesByMonth(salesHistory, fromMonth, toMonth) {
  const totals = new Map();
  salesHistory.forEach((s) => {
    const d = new Date(s.endTime);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key < fromMonth || key > toMonth) return;
    const cur = totals.get(key) || emptyPaymentTotals();
    cur.cash += s.payments?.cash || 0;
    cur.card += s.payments?.card || 0;
    cur.paypay += s.payments?.paypay || 0;
    cur.onAccount += s.payments?.onAccount || 0;
    cur.guests += s.guests || 0;
    totals.set(key, cur);
  });
  const points = [];
  for (let key = fromMonth; key <= toMonth; key = addMonths(key, 1)) {
    points.push({ key, label: key, ...(totals.get(key) || emptyPaymentTotals()) });
  }
  return points;
}

const GUEST_LINE_COLOR = COLORS.inkSoft;

function drawPaymentChart(canvas, { points, width, height }) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  if (points.length === 0) return;

  const padding = { top: 16, right: 46, bottom: 34, left: 74 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const totals = points.map((p) => PAYMENT_METHOD_ORDER.reduce((sum, k) => sum + p[k], 0));
  const maxVal = Math.max(1, ...totals);
  const maxGuests = Math.max(1, ...points.map((p) => p.guests));

  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartH);
  ctx.lineTo(padding.left + chartW, padding.top + chartH);
  ctx.moveTo(padding.left + chartW, padding.top);
  ctx.lineTo(padding.left + chartW, padding.top + chartH);
  ctx.stroke();

  const ySteps = 4;
  ctx.font = "11px " + SANS;
  ctx.textBaseline = "middle";
  for (let i = 0; i <= ySteps; i++) {
    const y = padding.top + chartH - (chartH * i) / ySteps;

    ctx.textAlign = "right";
    ctx.fillStyle = COLORS.inkSoft;
    ctx.fillText(Math.round((maxVal / ySteps) * i).toLocaleString("ja-JP"), padding.left - 8, y);

    ctx.textAlign = "left";
    ctx.fillStyle = GUEST_LINE_COLOR;
    ctx.fillText(Math.round((maxGuests / ySteps) * i).toLocaleString("ja-JP"), padding.left + chartW + 8, y);

    ctx.strokeStyle = "rgba(91,100,89,0.15)";
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();
  }

  const n = points.length;
  const slot = chartW / n;
  const barWidth = Math.min(40, slot * 0.6);

  points.forEach((p, i) => {
    const cx = padding.left + slot * i + slot / 2;
    let yCursor = padding.top + chartH;
    PAYMENT_METHOD_ORDER.forEach((k) => {
      const val = p[k];
      const barH = (val / maxVal) * chartH;
      ctx.fillStyle = PAYMENT_METHOD_COLORS[k];
      ctx.fillRect(cx - barWidth / 2, yCursor - barH, barWidth, barH);
      yCursor -= barH;
    });

    ctx.fillStyle = COLORS.inkSoft;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "11px " + SANS;
    ctx.fillText(p.label, cx, padding.top + chartH + 8);
  });

  // 人数の折れ線(右軸)
  ctx.strokeStyle = GUEST_LINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((p, i) => {
    const cx = padding.left + slot * i + slot / 2;
    const cy = padding.top + chartH - (p.guests / maxGuests) * chartH;
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.stroke();

  points.forEach((p, i) => {
    const cx = padding.left + slot * i + slot / 2;
    const cy = padding.top + chartH - (p.guests / maxGuests) * chartH;
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.paper;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = GUEST_LINE_COLOR;
    ctx.stroke();
  });
}

function AggregationGraphPanel({ data }) {
  const isNarrow = useMediaQuery("(max-width: 720px)");
  const today = toDateInputValue(new Date());
  const curMonth = currentMonthValue();

  const [granularity, setGranularity] = useState("daily"); // daily | monthly
  const [dailyFrom, setDailyFrom] = useState(addDays(today, -7));
  const [dailyTo, setDailyTo] = useState(today);
  const [monthlyFrom, setMonthlyFrom] = useState(addMonths(curMonth, -5));
  const [monthlyTo, setMonthlyTo] = useState(curMonth);

  const DAILY_MAX_DAYS = 92; // 約3ヶ月
  const MONTHLY_MAX_MONTHS = 35; // 3年(36ヶ月)未満に収める

  const handleDailyFromChange = (v) => {
    let to = dailyTo;
    if (v > to) to = v;
    if (daysBetween(v, to) > DAILY_MAX_DAYS) to = addDays(v, DAILY_MAX_DAYS);
    setDailyFrom(v);
    setDailyTo(to);
  };
  const handleDailyToChange = (v) => {
    let from = dailyFrom;
    if (v < from) from = v;
    if (daysBetween(from, v) > DAILY_MAX_DAYS) from = addDays(v, -DAILY_MAX_DAYS);
    setDailyTo(v);
    setDailyFrom(from);
  };
  const handleMonthlyFromChange = (v) => {
    let to = monthlyTo;
    if (v > to) to = v;
    if (monthDiff(v, to) > MONTHLY_MAX_MONTHS) to = addMonths(v, MONTHLY_MAX_MONTHS);
    setMonthlyFrom(v);
    setMonthlyTo(to);
  };
  const handleMonthlyToChange = (v) => {
    let from = monthlyFrom;
    if (v < from) from = v;
    if (monthDiff(from, v) > MONTHLY_MAX_MONTHS) from = addMonths(v, -MONTHLY_MAX_MONTHS);
    setMonthlyTo(v);
    setMonthlyFrom(from);
  };

  const points =
    granularity === "daily"
      ? aggregateSalesByDay(data.salesHistory, dailyFrom, dailyTo)
      : aggregateSalesByMonth(data.salesHistory, monthlyFrom, monthlyTo);

  const canvasRef = useRef(null);
  const minSlot = 44;
  const baseWidth = isNarrow ? 560 : 860;
  const width = Math.max(baseWidth, points.length * minSlot);
  const height = 260;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawPaymentChart(canvas, { points, width, height });
  }, [points, width, height]);

  const grandTotals = PAYMENT_METHOD_ORDER.reduce((acc, k) => {
    acc[k] = points.reduce((sum, p) => sum + p[k], 0);
    return acc;
  }, {});
  const grandSum = PAYMENT_METHOD_ORDER.reduce((sum, k) => sum + grandTotals[k], 0);
  const grandGuests = points.reduce((sum, p) => sum + p.guests, 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setGranularity("daily")} style={salesTabPillStyle(granularity === "daily")}>日毎</button>
          <button onClick={() => setGranularity("monthly")} style={salesTabPillStyle(granularity === "monthly")}>月毎</button>
        </div>

        {granularity === "daily" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="date" value={dailyFrom} onChange={(e) => handleDailyFromChange(e.target.value)} style={graphDateInputStyle} />
            <span style={{ color: COLORS.inkSoft, fontSize: 13 }}>〜</span>
            <input type="date" value={dailyTo} onChange={(e) => handleDailyToChange(e.target.value)} style={graphDateInputStyle} />
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="month" value={monthlyFrom} onChange={(e) => handleMonthlyFromChange(e.target.value)} style={graphDateInputStyle} />
            <span style={{ color: COLORS.inkSoft, fontSize: 13 }}>〜</span>
            <input type="month" value={monthlyTo} onChange={(e) => handleMonthlyToChange(e.target.value)} style={graphDateInputStyle} />
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 16 }}>
        {granularity === "daily" ? "※期間は最大3ヶ月まで指定できます" : "※期間は最大3年まで指定できます"}
      </div>

      <div style={{ overflowX: "auto", marginBottom: 8 }}>
        <canvas ref={canvasRef} width={width} height={height} style={{ display: "block" }} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 12, margin: "10px 0 4px" }}>
        {PAYMENT_METHOD_ORDER.map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: PAYMENT_METHOD_COLORS[k], display: "inline-block" }} />
            <span style={{ color: COLORS.inkSoft }}>{PAYMENT_METHOD_LABELS[k]}</span>
            <span style={{ fontFamily: MONO, color: COLORS.ink, fontWeight: 700 }}>{formatYen(grandTotals[k])}</span>
          </div>
        ))}
        <div style={{ fontFamily: MONO, fontWeight: 700, color: COLORS.teal }}>合計 {formatYen(grandSum)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 8, borderLeft: `1px solid ${COLORS.line}` }}>
          <span style={{ width: 14, height: 0, borderTop: `2px solid ${GUEST_LINE_COLOR}`, display: "inline-block", position: "relative" }}>
            <span style={{ position: "absolute", top: -3, left: 5, width: 6, height: 6, borderRadius: "50%", background: COLORS.paper, border: `2px solid ${GUEST_LINE_COLOR}`, boxSizing: "border-box" }} />
          </span>
          <span style={{ color: COLORS.inkSoft }}>人数(右軸)</span>
          <span style={{ fontFamily: MONO, color: COLORS.ink, fontWeight: 700 }}>{grandGuests.toLocaleString("ja-JP")}名</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   売上履歴パネル(売上管理内のサブタブ)
--------------------------------------------------------- */
const HISTORY_TABLE_COLS = "170px 110px 60px 60px 90px 90px 90px 100px 90px 90px 90px 90px 160px";

function SalesHistoryPanel({ salesHistory, onSelectSale }) {
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
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => setMode("today")} style={salesTabPillStyle(mode === "today")}>本日のみ</button>
        <button onClick={() => setMode("all")} style={salesTabPillStyle(mode === "all")}>すべて</button>
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
        <button
          onClick={() => {
            const suffix = mode === "today" ? "today" : mode === "date" ? dateValue : "all";
            downloadCsv(`sales-history_${suffix}_${csvTimestamp()}.csv`, salesHistoryToCsvRows(filtered));
          }}
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
          fontSize: 12,
          color: COLORS.inkSoft,
          marginBottom: 12,
        }}
      >
        <span>会計 {filtered.length}件</span>
        <span>合計 {formatYen(totalAmount)}</span>
      </div>

      {filtered.length === 0 && (
        <div style={{ color: COLORS.inkSoft, fontSize: 13, padding: "40px 0", textAlign: "center" }}>
          該当する会計データがありません
        </div>
      )}
      {filtered.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 1290 }}>
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
              <div>同伴</div>
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
                <div>{s.companion ? "○" : ""}</div>
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
  );
}

/* ---------------------------------------------------------
   売上管理画面(トップレベル)
--------------------------------------------------------- */
const SALES_MANAGEMENT_TABS = [
  { id: "history", label: "売上履歴" },
  { id: "entry", label: "入出金入力" },
  { id: "daily", label: "日次集計" },
  { id: "chart", label: "集計グラフ" },
];

function SalesManagementScreen({ data, onUpdateCashFlow, onOpenSettings, activeHomeTab, onSelectHomeTab, onSelectSale }) {
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
        {tab === "history" && <SalesHistoryPanel salesHistory={data.salesHistory} onSelectSale={onSelectSale} />}
        {tab === "entry" && <CashFlowEntryPanel cashFlow={data.cashFlow} onUpdateCashFlow={onUpdateCashFlow} />}
        {tab === "daily" && <DailySummaryPanel data={data} />}
        {tab === "chart" && <AggregationGraphPanel data={data} />}
      </div>
    </div>
  );
}
