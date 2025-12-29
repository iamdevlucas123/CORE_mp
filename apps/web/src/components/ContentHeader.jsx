import useSpaceStore from "../store/spaceStore.js";

export default function ContentHeader({ loading, onReload }) {
  const currentSpace = useSpaceStore((state) => state.currentSpace);

  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Espacos
        </p>
        <h1 className="mb-1 font-['Space_Grotesk'] text-2xl font-semibold">
          {currentSpace?.name || "Meu espaco"}
        </h1>
        <p className="text-sm text-slate-500">Lista</p>
      </div>
      <button
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
        onClick={onReload}
        disabled={loading}
      >
        Recarregar
      </button>
    </div>
  );
}
