import { useState } from "react";
import { formatEUR } from "../utils";

function BudgetRow({ item, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.limit || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const limit = Number(value) || 0;
    setSaving(true);
    try {
      await onSave(item.category, limit);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const percent = item.limit > 0 ? Math.min(100, Math.round((item.spent / item.limit) * 100)) : 0;

  return (
    <div className="budget-row">
      <div className="budget-row-top">
        <span className="cat-name">{item.category}</span>
        {editing ? (
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="number"
              min="0"
              step="1"
              className="budget-limit-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
            <button className="budget-edit-btn" onClick={handleSave} disabled={saving}>
              {saving ? "…" : "OK"}
            </button>
          </span>
        ) : (
          <span className={`cat-amounts${item.over ? " over" : ""}`}>
            {formatEUR(item.spent)} {item.limit > 0 ? `/ ${formatEUR(item.limit)}` : ""}{" "}
            <button className="budget-edit-btn" onClick={() => setEditing(true)}>
              ✎
            </button>
          </span>
        )}
      </div>
      {item.limit > 0 && (
        <div className="budget-bar-track">
          <div
            className={`budget-bar-fill${item.over ? " over" : ""}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function BudgetList({ byCategory, onSaveBudget }) {
  if (!byCategory || byCategory.length === 0) return null;
  return (
    <div className="budget-list">
      {byCategory.map((item) => (
        <BudgetRow key={item.category} item={item} onSave={onSaveBudget} />
      ))}
    </div>
  );
}
