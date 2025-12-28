export default function Dashboard({ tasks = [] }) {
  const total = tasks.length;
  const byStatus = tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    { todo: 0, doing: 0, done: 0 }
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Resumo</h2>
        <p className="text-sm text-slate-500">Visao geral das tarefas</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
          <p className="text-2xl font-semibold text-slate-800">{total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Todo</p>
          <p className="text-2xl font-semibold text-slate-800">{byStatus.todo}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Doing</p>
          <p className="text-2xl font-semibold text-slate-800">{byStatus.doing}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Done</p>
          <p className="text-2xl font-semibold text-slate-800">{byStatus.done}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-600">
            Status em destaque
          </h3>
          <div className="space-y-3">
            {["todo", "doing", "done"].map((status) => {
              const count = byStatus[status] || 0;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span className="uppercase">{status}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-600">
            Ultimas tarefas
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {tasks.slice(0, 5).map((task) => (
              <li key={task.id} className="flex items-center justify-between">
                <span className="truncate">{task.title}</span>
                <span className="text-xs uppercase text-slate-400">
                  {task.status}
                </span>
              </li>
            ))}
            {!tasks.length ? (
              <li className="text-slate-400">Sem tarefas ainda</li>
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  );
}
