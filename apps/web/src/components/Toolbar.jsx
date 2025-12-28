export default function Toolbar() {
  return (
    <div className="mb-4 grid grid-cols-1 items-center gap-3 md:grid-cols-[minmax(240px,1fr)_auto]">
      <input
        type="search"
        placeholder="Pesquisar lista"
        aria-label="Pesquisar lista"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700" type="button">
        Filtro
      </button>
    </div>
  );
}
