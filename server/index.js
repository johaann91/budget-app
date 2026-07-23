import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, categoriesFor } from "./categories.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRANSACTIONS_FILE = path.join(__dirname, "data", "transactions.json");
const BUDGETS_FILE = path.join(__dirname, "data", "budgets.json");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

async function readJSON(file, fallback) {
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJSON(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

const readTransactions = () => readJSON(TRANSACTIONS_FILE, []);
const writeTransactions = (data) => writeJSON(TRANSACTIONS_FILE, data);
const readBudgets = () => readJSON(BUDGETS_FILE, {});
const writeBudgets = (data) => writeJSON(BUDGETS_FILE, data);

function monthKey(dateStr) {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function validatePayload(body, { partial = false } = {}) {
  const errors = [];
  const clean = {};

  const type = body.type !== undefined ? body.type : undefined;
  if (!partial || type !== undefined) {
    if (type !== "income" && type !== "expense") {
      errors.push("Le type doit être 'income' ou 'expense'.");
    } else {
      clean.type = type;
    }
  }

  if (body.amount !== undefined) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push("Le montant doit être un nombre positif.");
    } else {
      clean.amount = Math.round(amount * 100) / 100;
    }
  } else if (!partial) {
    errors.push("Le montant est requis.");
  }

  if (body.category !== undefined) {
    const refType = clean.type || body.type;
    const validCategories = categoriesFor(refType);
    if (!validCategories.includes(body.category)) {
      errors.push("Catégorie invalide pour ce type de transaction.");
    } else {
      clean.category = body.category;
    }
  } else if (!partial) {
    errors.push("La catégorie est requise.");
  }

  if (body.description !== undefined) {
    clean.description =
      typeof body.description === "string" ? body.description.trim().slice(0, 200) : "";
  }

  if (body.date !== undefined) {
    const d = body.date ? new Date(body.date) : new Date();
    if (Number.isNaN(d.getTime())) {
      errors.push("Date invalide.");
    } else {
      clean.date = d.toISOString().slice(0, 10);
    }
  } else if (!partial) {
    clean.date = new Date().toISOString().slice(0, 10);
  }

  return { errors, clean };
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/categories", (req, res) => {
  res.json({ expense: EXPENSE_CATEGORIES, income: INCOME_CATEGORIES });
});

app.get("/api/transactions", async (req, res) => {
  const { month, type, category, q, sort } = req.query;
  let list = await readTransactions();

  if (month) {
    list = list.filter((t) => monthKey(t.date) === month);
  }
  if (type === "income" || type === "expense") {
    list = list.filter((t) => t.type === type);
  }
  if (category) {
    list = list.filter((t) => t.category === category);
  }
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((t) => (t.description || "").toLowerCase().includes(needle));
  }

  list = list.slice().sort((a, b) => {
    if (sort === "amount") return b.amount - a.amount;
    return new Date(b.date) - new Date(a.date) || b.createdAt.localeCompare(a.createdAt);
  });

  res.json(list);
});

app.post("/api/transactions", async (req, res) => {
  const { errors, clean } = validatePayload(req.body || {});
  if (errors.length > 0) return res.status(400).json({ errors });

  const now = new Date().toISOString();
  const transaction = {
    id: crypto.randomUUID(),
    type: clean.type,
    amount: clean.amount,
    category: clean.category,
    description: clean.description || "",
    date: clean.date,
    createdAt: now,
  };

  const list = await readTransactions();
  list.push(transaction);
  await writeTransactions(list);
  res.status(201).json(transaction);
});

app.put("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const list = await readTransactions();
  const index = list.findIndex((t) => t.id === id);
  if (index === -1) return res.status(404).json({ error: "Transaction introuvable." });

  const merged = { ...list[index], ...req.body };
  const { errors, clean } = validatePayload(
    { type: merged.type, amount: merged.amount, category: merged.category, description: merged.description, date: merged.date },
    { partial: false }
  );
  if (errors.length > 0) return res.status(400).json({ errors });

  list[index] = { ...list[index], ...clean };
  await writeTransactions(list);
  res.json(list[index]);
});

app.delete("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const list = await readTransactions();
  const next = list.filter((t) => t.id !== id);
  if (next.length === list.length) return res.status(404).json({ error: "Transaction introuvable." });
  await writeTransactions(next);
  res.status(204).end();
});

app.get("/api/budgets", async (req, res) => {
  const budgets = await readBudgets();
  res.json(budgets);
});

app.put("/api/budgets/:category", async (req, res) => {
  const { category } = req.params;
  if (!EXPENSE_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Catégorie de dépense invalide." });
  }
  const limit = Number(req.body?.limit);
  if (!Number.isFinite(limit) || limit < 0) {
    return res.status(400).json({ error: "La limite doit être un nombre positif ou nul." });
  }

  const budgets = await readBudgets();
  budgets[category] = Math.round(limit * 100) / 100;
  await writeBudgets(budgets);
  res.json(budgets);
});

app.delete("/api/budgets/:category", async (req, res) => {
  const { category } = req.params;
  const budgets = await readBudgets();
  delete budgets[category];
  await writeBudgets(budgets);
  res.json(budgets);
});

app.get("/api/summary", async (req, res) => {
  const month = req.query.month || currentMonthKey();
  const [transactions, budgets] = await Promise.all([readTransactions(), readBudgets()]);

  const monthTx = transactions.filter((t) => monthKey(t.date) === month);
  const income = round2(monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0));
  const expenses = round2(monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0));

  const byCategory = EXPENSE_CATEGORIES.map((category) => {
    const spent = round2(
      monthTx
        .filter((t) => t.type === "expense" && t.category === category)
        .reduce((s, t) => s + t.amount, 0)
    );
    const limit = budgets[category] || 0;
    const remaining = round2(limit - spent);
    const percent = limit > 0 ? Math.round((spent / limit) * 100) : null;
    return { category, spent, limit, remaining, percent, over: limit > 0 && spent > limit };
  });

  // Tendance sur les 6 derniers mois (y compris le mois demandé).
  const trend = [];
  const [year, mon] = month.split("-").map(Number);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(year, mon - 1 - i, 1));
    const key = d.toISOString().slice(0, 7);
    const tx = transactions.filter((t) => monthKey(t.date) === key);
    trend.push({
      month: key,
      income: round2(tx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)),
      expenses: round2(tx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)),
    });
  }

  res.json({
    month,
    income,
    expenses,
    balance: round2(income - expenses),
    byCategory,
    trend,
  });
});

function round2(n) {
  return Math.round(n * 100) / 100;
}

app.listen(PORT, () => {
  console.log(`API de budget disponible sur http://localhost:${PORT}`);
});
