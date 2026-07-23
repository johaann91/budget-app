export const EXPENSE_CATEGORIES = [
  "Alimentation",
  "Logement",
  "Transport",
  "Loisirs",
  "Santé",
  "Shopping",
  "Factures",
  "Éducation",
  "Autres",
];

export const INCOME_CATEGORIES = [
  "Salaire",
  "Freelance",
  "Investissement",
  "Cadeau",
  "Autres",
];

export function categoriesFor(type) {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
