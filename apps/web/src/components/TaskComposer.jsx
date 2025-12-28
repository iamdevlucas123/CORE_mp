import { STATUSES } from "@core/shared";

export default function TaskComposer({
  title,
  status,
  onTitleChange,
  onStatusChange,
  onSubmit,
}) {
  return (
    <form
      className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(220px,1fr)_160px_140px]"
      onSubmit={onSubmit}
    >
      <input
        type="text"
        placeholder="Nova tarefa"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
      >
        {STATUSES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Adicionar
      </button>
    </form>
  );
}
