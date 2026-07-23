import { formatEUR } from "../utils";

export default function SummaryRow({ summary }) {
  if (!summary) return null;
  const positive = summary.balance >= 0;

  return (
    <div className="summary-row">
      <div className="summary-card income">
        <div className="label">Revenus</div>
        <div className="value">{formatEUR(summary.income)}</div>
      </div>
      <div className="summary-card expenses">
        <div className="label">Dépenses</div>
        <div className="value">{formatEUR(summary.expenses)}</div>
      </div>
      <div className={`summary-card balance ${positive ? "positive" : "negative"}`}>
        <div className="label">Solde</div>
        <div className="value">{formatEUR(summary.balance)}</div>
      </div>
    </div>
  );
}
