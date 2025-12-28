import { STATUSES } from "@core/shared";
import List from "./List.jsx";
import Dashboard from "./Dashboard.jsx";
import Timeline from "./Timeline.jsx";
import useViewStore from "../store/viewStore.js";

export default function Board({ tasks, columns, onUpdateTask, onDeleteTask }) {
  const activeView = useViewStore((state) => state.activeView);
  const showDashboard = activeView === "Resumo";
  const showList = activeView === "Lista";
  const showBoard = activeView === "Quadro";
  const showTimeline = activeView === "Cronograma";

  return (
    <div>
      {showDashboard ? <Dashboard tasks={tasks} /> : null}
      {showList ? <List tasks={tasks} /> : null}
      {showTimeline ? <Timeline tasks={tasks} /> : null}
      {showBoard ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STATUSES.map((column) => (
          <section
            key={column}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(20,24,36,0.08)]"
          >
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {column}
            </h2>
            <div className="grid gap-3">
              {columns[column].map((task) => (
                <article
                  key={task.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="mb-3 font-semibold text-slate-800">{task.title}</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={task.status}
                      onChange={(event) =>
                        onUpdateTask(task.id, event.target.value)
                      }
                      className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                    >
                      {STATUSES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <button
                      className="rounded-lg bg-red-600 px-2 py-1 text-sm font-semibold text-white"
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      Remover
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        </div>
      ) : null}
    </div>
  );
}
