const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.errors?.join(" ") || data?.error || `Erreur API (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export function getTransactions({ month, type, category, q, sort } = {}) {
  const params = new URLSearchParams();
  if (month) params.set("month", month);
  if (type) params.set("type", type);
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  return request(`/api/transactions${qs ? `?${qs}` : ""}`);
}

export function getCategories() {
  return request("/api/categories");
}

export function getSummary(month) {
  return request(`/api/summary?month=${month}`);
}

export function getBudgets() {
  return request("/api/budgets");
}

export function setBudget(category, limit) {
  return request(`/api/budgets/${encodeURIComponent(category)}`, {
    method: "PUT",
    body: JSON.stringify({ limit }),
  });
}

export function removeBudget(category) {
  return request(`/api/budgets/${encodeURIComponent(category)}`, { method: "DELETE" });
}

export function createTransaction(payload) {
  return request("/api/transactions", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTransaction(id, payload) {
  return request(`/api/transactions/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteTransaction(id) {
  return request(`/api/transactions/${id}`, { method: "DELETE" });
}
