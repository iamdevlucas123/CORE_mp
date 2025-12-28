const STATUS_STYLES = {
  todo: "bg-slate-200 text-slate-700",
  doing: "bg-blue-200 text-blue-900",
  done: "bg-green-200 text-green-900",
};

export default function List({ tasks = [] }) {
  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="w-10 border-b border-slate-200 px-3 py-2"> </th>
              <th className="border-b border-slate-200 px-3 py-2">Tipo</th>
              <th className="border-b border-slate-200 px-3 py-2">Chave</th>
              <th className="border-b border-slate-200 px-3 py-2">Resumo</th>
              <th className="border-b border-slate-200 px-3 py-2">Status</th>
              <th className="border-b border-slate-200 px-3 py-2">
                Responsavel
              </th>
              <th className="border-b border-slate-200 px-3 py-2">
                Data de entrega
              </th>
              <th className="border-b border-slate-200 px-3 py-2">Prioridade</th>
              <th className="w-10 border-b border-slate-200 px-3 py-2">
                <button
                  type="button"
                  className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-500"
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={task.id} className={index % 2 ? "bg-slate-50/40" : ""}>
                <td className="border-b border-slate-200 px-3 py-2">
                  <input type="checkbox" />
                </td>
                <td className="border-b border-slate-200 px-3 py-2">
                  <span className="text-blue-600">⚡</span>
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-slate-600">
                  DEV-{task.id}
                </td>
                <td className="border-b border-slate-200 px-3 py-2">
                  {task.title}
                </td>
                <td className="border-b border-slate-200 px-3 py-2">
                  <span
                    className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                      STATUS_STYLES[task.status] || STATUS_STYLES.todo
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="border-b border-slate-200 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      LB
                    </span>
                    <span className="text-slate-700">lucas borges</span>
                  </div>
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-slate-600">
                  9 de jan. de 2026
                </td>
                <td className="border-b border-slate-200 px-3 py-2 text-slate-600">
                  Medium
                </td>
                <td className="border-b border-slate-200 px-3 py-2"> </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600"
      >
        <span className="text-lg">+</span>
        Criar
      </button>
    </section>
  );
}
