import { useState } from "react";
import { formatEUR, formatDate } from "../utils";

export default function TransactionRow({ tx, categories, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    amount: tx.amount,
    category: tx.category,
    description: tx.description || "",
    date: tx.date,
  });
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    const amount = Number(form.amount);
    if (!amount || amount <= 0 || saving) return;
    setSaving(true);
    try {
      await onUpdate(tx.id, {
        type: tx.type,
        amount,
        category: form.category,
        description: form.description,
        date: form.date,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    const options = categories?.[tx.type] || [];
    return (
      <div className="tx-row">
        <div style={{ flex: 1, display: "grid", gap: 8 }}>
          <div className="row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              style={{ flex: "1 1 90px", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }}
              onChange={(e) => update("amount", e.target.value)}
            />
            <select
              value={form.category}
              style={{ flex: "1 1 120px", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }}
              onChange={(e) => update("category", e.target.value)}
            >
              {options.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={form.date}
              style={{ flex: "1 1 120px", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }}
              onChange={(e) => update("date", e.target.value)}
            />
          </div>
          <input
            type="text"
            value={form.description}
            placeholder="Description"
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }}
            onChange={(e) => update("description", e.target.value)}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
              Annuler
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? "…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tx-row">
      <span className={`tx-type-dot ${tx.type}`} />
      <div className="tx-info">
        <div className="tx-desc">{tx.description || tx.category}</div>
        <div className="tx-sub">
          {tx.category} · {formatDate(tx.date)}
        </div>
      </div>
      <span className={`tx-amount ${tx.type}`}>
        {tx.type === "income" ? "+" : "-"}
        {formatEUR(tx.amount)}
      </span>
      <div className="tx-actions">
        <button className="icon-btn" onClick={() => setEditing(true)} aria-label="Modifier">
          ✎
        </button>
        <button className="icon-btn danger" onClick={() => onDelete(tx.id)} aria-label="Supprimer">
          ✕
        </button>
      </div>
    </div>
  );
}
