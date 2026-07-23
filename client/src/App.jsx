import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MonthSelector from "./components/MonthSelector";
import SummaryRow from "./components/SummaryRow";
import CategoryDonut from "./components/CategoryDonut";
import TrendBarChart from "./components/TrendBarChart";
import BudgetList from "./components/BudgetList";
import TransactionForm from "./components/TransactionForm";
import FilterBar from "./components/FilterBar";
import TransactionRow from "./components/TransactionRow";
import {
  getTransactions,
  getCategories,
  getSummary,
  setBudget,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "./api";
import { currentMonthKey } from "./utils";

export default function App() {
  const [month, setMonth] = useState(currentMonthKey);
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await getSummary(month);
      setSummary(data);
    } catch (err) {
      setError(err.message);
    }
  }, [month]);

  const loadTransactions = useCallback(async () => {
    try {
      setError(null);
      const data = await getTransactions({
        month,
        type: typeFilter || undefined,
        category: categoryFilter || undefined,
        q: debouncedSearch || undefined,
      });
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, typeFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  async function refreshAll() {
    await Promise.all([loadTransactions(), loadSummary()]);
  }

  async function handleCreate(payload) {
    await createTransaction(payload);
    await refreshAll();
  }

  async function handleUpdate(id, payload) {
    await updateTransaction(id, payload);
    await refreshAll();
  }

  async function handleDelete(id) {
    await deleteTransaction(id);
    await refreshAll();
  }

  async function handleSaveBudget(category, limit) {
    if (limit > 0) {
      await setBudget(category, limit);
    }
    await loadSummary();
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <section className="hero">
          <p className="hero-eyebrow">Suivi de budget</p>
          <h1>Ton budget, clair et net.</h1>
          <MonthSelector month={month} onChange={setMonth} />
        </section>

        <div className="container section">
          <SummaryRow summary={summary} />

          {error && <p className="state-msg">Impossible de contacter l'API ({error}).</p>}

          <div className="panels-grid">
            <div className="panel">
              <h2>Répartition des dépenses</h2>
              <CategoryDonut byCategory={summary?.byCategory} />
            </div>
            <div className="panel">
              <h2>Tendance sur 6 mois</h2>
              <TrendBarChart trend={summary?.trend} />
            </div>
          </div>

          <div className="panel">
            <h2>Budgets par catégorie</h2>
            <BudgetList byCategory={summary?.byCategory} onSaveBudget={handleSaveBudget} />
          </div>

          <TransactionForm categories={categories} onCreate={handleCreate} />

          <FilterBar
            search={search}
            onSearchChange={setSearch}
            type={typeFilter}
            onTypeChange={setTypeFilter}
            category={categoryFilter}
            onCategoryChange={setCategoryFilter}
            categories={categories}
          />

          {loading && <p className="state-msg">Chargement des transactions…</p>}

          {!loading && transactions.length === 0 && (
            <p className="state-msg">Aucune transaction pour ce mois.</p>
          )}

          {!loading && transactions.length > 0 && (
            <div className="tx-list">
              {transactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  categories={categories}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
