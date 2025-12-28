const MONTHS = ["Nov", "Dec", "Jan '26", "Feb '26"];

function getBarStyle(index) {
  const starts = ["col-start-2", "col-start-3", "col-start-1", "col-start-2"];
  const spans = ["col-span-2", "col-span-1", "col-span-3", "col-span-2"];
  return `${starts[index % starts.length]} ${spans[index % spans.length]}`;
}

export default function Timeline({ tasks = [] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          <span>🔍</span>
          <span>Pesquisar linha do tempo</span>
        </div>
        <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
          Epic
        </button>
        <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
          Categoria do status
        </button>
      </div>

      <div className="grid grid-cols-[280px_minmax(600px,1fr)]">
        <div className="border-r border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
            Ticket
          </div>
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 text-sm text-slate-700"
            >
              <input type="checkbox" />
              <span className="text-purple-500">⚡</span>
              <span className="font-semibold">DEV-{task.id}</span>
              <span className="truncate">{task.title}</span>
            </div>
          ))}
          <button className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-600">
            <span className="text-lg">+</span>
            Criar Epic
          </button>
        </div>

        <div className="relative overflow-x-auto">
          <div className="grid min-w-[600px] grid-cols-4 border-b border-slate-200 bg-slate-50 text-center text-sm font-semibold text-slate-500">
            {MONTHS.map((month) => (
              <div key={month} className="border-l border-slate-200 px-4 py-3">
                {month}
              </div>
            ))}
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 grid grid-cols-4">
              <div className="border-l border-slate-200" />
              <div className="border-l border-slate-200" />
              <div className="border-l border-slate-200" />
              <div className="border-l border-slate-200" />
            </div>
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="relative grid min-w-[600px] grid-cols-4 border-b border-slate-200 px-4 py-4"
              >
                <div
                  className={`h-6 rounded-full bg-gradient-to-r from-purple-200 via-fuchsia-300 to-purple-400 ${getBarStyle(
                    index
                  )}`}
                />
              </div>
            ))}
            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-blue-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
