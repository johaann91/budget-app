import { formatMonthShort, formatEUR } from "../utils";

export default function TrendBarChart({ trend }) {
  if (!trend || trend.length === 0) return null;

  const max = Math.max(1, ...trend.map((t) => Math.max(t.income, t.expenses)));

  return (
    <div>
      <div className="bar-chart">
        {trend.map((t) => (
          <div className="bar-group" key={t.month}>
            <div className="bar-pair" title={`${formatEUR(t.income)} de revenus, ${formatEUR(t.expenses)} de dépenses`}>
              <div
                className="bar income-bar"
                style={{ height: `${(t.income / max) * 100}%` }}
              />
              <div
                className="bar expense-bar"
                style={{ height: `${(t.expenses / max) * 100}%` }}
              />
            </div>
            <span className="bar-month-label">{formatMonthShort(t.month)}</span>
          </div>
        ))}
      </div>
      <div className="chart-legend-row">
        <span><span className="legend-dot" style={{ background: "var(--green)", display: "inline-block", marginRight: 6 }} />Revenus</span>
        <span><span className="legend-dot" style={{ background: "var(--red)", display: "inline-block", marginRight: 6 }} />Dépenses</span>
      </div>
    </div>
  );
}
