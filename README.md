# Budget — suivi de dépenses (React + Node)

Application de suivi de budget personnel avec un design façon apple.com.
Pas de compte utilisateur : un seul budget, stocké côté serveur dans des
fichiers JSON. Montants en euros.

## Structure

```
budget-app/
├── client/     → application React (Vite)
├── server/     → API Node/Express (transactions, budgets, résumé)
```

## Fonctionnalités

- **Revenus et dépenses** : ajout, édition inline, suppression, avec calcul
  automatique du solde net par mois.
- **Catégories** prédéfinies : 9 catégories de dépenses (Alimentation,
  Logement, Transport, Loisirs, Santé, Shopping, Factures, Éducation,
  Autres) et 5 catégories de revenus (Salaire, Freelance, Investissement,
  Cadeau, Autres).
- **Budget mensuel par catégorie** : définis une limite pour chaque
  catégorie de dépense, avec barre de progression et alerte visuelle
  (rouge) en cas de dépassement.
- **Graphiques** : un donut de répartition des dépenses du mois par
  catégorie, et un graphique en barres comparant revenus/dépenses sur les
  6 derniers mois. Générés en SVG/CSS natif, sans librairie externe.
- **Navigation par mois** : flèches pour parcourir l'historique.
- Recherche et filtres (type, catégorie) sur la liste des transactions.

## Lancer le projet en local

Deux terminaux : un pour le serveur, un pour le client.

### 1. Le serveur

```bash
cd server
npm install
npm start
```

Écoute sur `http://localhost:5000`. Les données sont persistées dans
`server/data/transactions.json` et `server/data/budgets.json`.

### 2. Le client

```bash
cd client
npm install
npm run dev
```

Le site est accessible sur `http://localhost:5173`. Il appelle l'API sur
`http://localhost:5000` par défaut — modifiable via `client/.env` (voir
`client/.env.example`).

## Build de production

```bash
cd client
npm run build
```

## API

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/transactions?month=&type=&category=&q=` | Liste filtrée des transactions |
| POST | `/api/transactions` | Créer `{ type, amount, category, description?, date? }` |
| PUT | `/api/transactions/:id` | Modifier une transaction |
| DELETE | `/api/transactions/:id` | Supprimer une transaction |
| GET | `/api/categories` | Catégories disponibles (revenus / dépenses) |
| GET | `/api/budgets` | Limites mensuelles par catégorie |
| PUT | `/api/budgets/:category` | Définir la limite `{ limit }` |
| DELETE | `/api/budgets/:category` | Supprimer la limite d'une catégorie |
| GET | `/api/summary?month=YYYY-MM` | Revenus, dépenses, solde, répartition par catégorie, tendance 6 mois |

`type` vaut `income` ou `expense`. `month` est au format `YYYY-MM`, par
défaut le mois en cours.

## Personnaliser le design

Les couleurs vivent dans `client/src/index.css`. Les couleurs des
catégories pour le graphique donut sont dans `client/src/utils.js`
(`CATEGORY_COLORS`).
# budget-app
