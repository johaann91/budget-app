export default function FilterBar({
  search,
  onSearchChange,
  type,
  onTypeChange,
  category,
  onCategoryChange,
  categories,
}) {
  const allCategories = [...(categories?.expense || []), ...(categories?.income || [])];
  const uniqueCategories = [...new Set(allCategories)];

  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Rechercher une description…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select value={type} onChange={(e) => onTypeChange(e.target.value)}>
        <option value="">Tous types</option>
        <option value="income">Revenus</option>
        <option value="expense">Dépenses</option>
      </select>
      <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="">Toutes catégories</option>
        {uniqueCategories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
