export default function Topbar() {
  return (
    <header className="sticky top-0 z-10 grid grid-cols-1 items-center gap-4 border-b border-slate-200 bg-white px-6 py-3 lg:grid-cols-[220px_minmax(0,1fr)_auto]">
      <div className="flex items-center gap-2 font-['Space_Grotesk'] text-lg font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white font-bold">
          C
        </span>
        <span>Core</span>
      </div>
      <div>
        <input
          type="search"
          placeholder="Pesquisar"
          aria-label="Pesquisar"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white" type="button">
          + Criar
        </button>
        <button
          className="rounded-full border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600"
          type="button"
        >
          Avaliacao Premium
        </button>
      </div>
    </header>
  );
}
