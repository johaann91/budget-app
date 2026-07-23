import { formatMonthLabel, shiftMonth, currentMonthKey } from "../utils";

export default function MonthSelector({ month, onChange }) {
  const isCurrent = month === currentMonthKey();

  return (
    <div className="month-selector">
      <button onClick={() => onChange(shiftMonth(month, -1))} aria-label="Mois précédent">
        ←
      </button>
      <span className="month-label">{formatMonthLabel(month)}</span>
      <button
        onClick={() => onChange(shiftMonth(month, 1))}
        aria-label="Mois suivant"
        disabled={isCurrent}
        style={isCurrent ? { opacity: 0.3, cursor: "default" } : undefined}
      >
        →
      </button>
    </div>
  );
}
