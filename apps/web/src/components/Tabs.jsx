import { useState } from "react";
import useViewStore from "../store/viewStore.js";

const DEFAULT_TABS = ["Resumo","Lista", "Quadro", "Cronograma", "Paginas"];
const MORE_TABS = [
  "Backlog",
  "Código",
  "Relatorios",
  "Tickets arquivados",
];

export default function Tabs() {
  const [tabs, setTabs] = useState(DEFAULT_TABS);
  const [open, setOpen] = useState(false);
  const activeView = useViewStore((state) => state.activeView);
  const setActiveView = useViewStore((state) => state.setActiveView);

  function handleAddTab(name) {
    if (!tabs.includes(name)) {
      setTabs((current) => [...current, name]);
    }
    setActiveView(name);
    setOpen(false);
  }

  return (
    <div className="relative mb-4">
      <nav className="flex items-center gap-4 border-b border-slate-200">
        {tabs.map((tab) => {
          const isActive = tab === activeView;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveView(tab)}
              className={`pb-2 text-sm font-semibold ${
                isActive
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500"
              }`}
            >
              {tab}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="ml-auto mb-2 rounded-md border border-blue-600 px-2 py-1 text-blue-600"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          +
        </button>
      </nav>

      {open ? (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Exibicoes
          </p>
          <div className="max-h-64 overflow-y-auto">
            {MORE_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleAddTab(tab)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
