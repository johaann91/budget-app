import { CATEGORY_COLORS, formatEUR } from "../utils";

const SIZE = 160;
const RADIUS = 60;
const STROKE = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CategoryDonut({ byCategory }) {
  const slices = (byCategory || []).filter((c) => c.spent > 0);
  const total = slices.reduce((sum, c) => sum + c.spent, 0);

  if (total === 0) {
    return <p className="state-msg" style={{ padding: "20px 0" }}>Aucune dépense ce mois-ci.</p>;
  }

  let cumulative = 0;
  const segments = slices.map((c) => {
    const fraction = c.spent / total;
    const length = fraction * CIRCUMFERENCE;
    const offset = cumulative * CIRCUMFERENCE;
    cumulative += fraction;
    return { ...c, length, offset };
  });

  return (
    <div className="donut-wrap">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Répartition des dépenses par catégorie"
      >
        <g transform={`translate(${SIZE / 2}, ${SIZE / 2}) rotate(-90)`}>
          <circle r={RADIUS} fill="none" stroke="var(--border-light)" strokeWidth={STROKE} />
          {segments.map((s) => (
            <circle
              key={s.category}
              r={RADIUS}
              fill="none"
              stroke={CATEGORY_COLORS[s.category] || "#8e8e93"}
              strokeWidth={STROKE}
              strokeDasharray={`${s.length} ${CIRCUMFERENCE - s.length}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          fontSize="13"
          fill="var(--text-secondary)"
        >
          Total
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          fontSize="15"
          fontWeight="600"
          fill="var(--text)"
        >
          {formatEUR(total)}
        </text>
      </svg>

      <div className="donut-legend">
        {segments
          .slice()
          .sort((a, b) => b.spent - a.spent)
          .map((s) => (
            <div className="legend-item" key={s.category}>
              <span
                className="legend-dot"
                style={{ background: CATEGORY_COLORS[s.category] || "#8e8e93" }}
              />
              <span>{s.category}</span>
              <span className="legend-amount">{formatEUR(s.spent)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
