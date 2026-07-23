import { useState } from "react";

function emptyForm(type, categories) {
  return {
    type,
    amount: "",
    category: categories?.[type]?.[0] || "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

export default function TransactionForm({ categories, onCreate }) {
  const [form, setForm] = useState(() => emptyForm("expense", categories));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function setType(type) {
    setForm((f) => ({ ...f, type, category: categories?.[type]?.[0] || "" }));
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0 || !form.category || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        type: form.type,
        amount,
        category: form.category,
        description: form.description,
        date: form.date,
      });
      setForm(emptyForm(form.type, categories));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const options = categories?.[form.type] || [];

  return (
    <form className="tx-form" onSubmit={handleSubmit}>
      <div className="type-toggle">
        <button
          type="button"
          className={`expense${form.type === "expense" ? " active expense" : ""}`}
          onClick={() => setType("expense")}
        >
          Dépense
        </button>
        <button
          type="button"
          className={`income${form.type === "income" ? " active income" : ""}`}
          onClick={() => setType("income")}
        >
          Revenu
        </button>
      </div>

      <div className="row">
        <div>
          <span className="field-label">Montant (€)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
          />
        </div>
        <div>
          <span className="field-label">Catégorie</span>
          <select value={form.category} onChange={(e) => update("category", e.target.value)}>
            {options.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="field-label">Date</span>
          <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
        </div>
      </div>

      <div>
        <span className="field-label">Description (optionnel)</span>
        <input
          type="text"
          placeholder="Courses de la semaine…"
          value={form.description}
          maxLength={200}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      {error && <p style={{ color: "var(--red)", fontSize: 13, margin: 0 }}>{error}</p>}

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!form.amount || Number(form.amount) <= 0 || submitting}
        >
          {submitting ? "Ajout…" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
