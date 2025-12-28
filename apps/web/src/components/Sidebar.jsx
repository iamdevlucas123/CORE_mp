import { useState } from "react";
import useSpaceStore from "../store/spaceStore.js";

export default function Sidebar() {
  const recents = useSpaceStore((state) => state.recents);
  const currentSpace = useSpaceStore((state) => state.currentSpace);
  const addSpace = useSpaceStore((state) => state.addSpace);
  const selectSpace = useSpaceStore((state) => state.selectSpace);
  const [showInput, setShowInput] = useState(false);
  const [spaceName, setSpaceName] = useState("");

  function handleAddSpace() {
    const trimmed = spaceName.trim();
    if (!trimmed) return;
    addSpace(trimmed);
    setSpaceName("");
    setShowInput(false);
  }

  return (
    <aside className="flex flex-col gap-5 border-b border-slate-200 bg-slate-50 p-5 lg:border-b-0 lg:border-r">
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Para voce
        </h4>
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Espacos
          </h5>
          <button
            className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-500"
            type="button"
            onClick={() => setShowInput((current) => !current)}
            aria-label="Criar espaco"
          >
            +
          </button>
        </div>
        {showInput ? (
          <input
            type="text"
            placeholder="Nome do espaco"
            value={spaceName}
            onChange={(event) => setSpaceName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddSpace();
              }
              if (event.key === "Escape") {
                setShowInput(false);
                setSpaceName("");
              }
            }}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            autoFocus
          />
        ) : null}
      </div>
      <div>
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recente
        </h5>
        {recents.map((item, index) => (
          <button
            key={`${item}-${index}`}
            type="button"
            onClick={() => selectSpace(item)}
            className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
              item === currentSpace
                ? "bg-blue-50 font-semibold text-blue-600"
                : "text-slate-500"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div>
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recomendado
        </h5>
        <div className="rounded-lg px-2 py-2 text-sm text-slate-500">
          Coletar solicit...
        </div>
      </div>
    </aside>
  );
}
