import { useMemo, useState } from "react";
import { STATUSES } from "@core/shared";
import List from "./List.jsx";
import Dashboard from "./Dashboard.jsx";
import Timeline from "./Timeline.jsx";
import useViewStore from "../store/viewStore.js";

const BASE_COLUMNS = STATUSES.map((status) => ({
  id: status,
  label: status,
  isCustom: false,
}));

export default function Board({
  tasks,
  columns,
  onUpdateTask,
  onDeleteTask,
  onCreateTask,
}) {
  const activeView = useViewStore((state) => state.activeView);
  const showDashboard = activeView === "Resumo";
  const showList = activeView === "Lista";
  const showBoard = activeView === "Quadro";
  const showTimeline = activeView === "Cronograma";
  const [customColumns, setCustomColumns] = useState([]);
  const [customCards, setCustomCards] = useState({});
  const [taskMeta, setTaskMeta] = useState({});
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [openComposerId, setOpenComposerId] = useState(null);
  const [draftTitle, setDraftTitle] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState(null);
  const [modalTask, setModalTask] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [formState, setFormState] = useState({
    title: "",
    ticket: "",
    description: "",
    comment: "",
    team: "",
    startDate: "",
    dueDate: "",
    assignee: "",
    status: STATUSES[0],
  });

  const boardColumns = useMemo(
    () => [...BASE_COLUMNS, ...customColumns],
    [customColumns]
  );

  function handleAddColumn() {
    const trimmed = newColumnName.trim();
    if (!trimmed) return;
    const id = `custom-${Date.now()}`;
    setCustomColumns((current) => [...current, { id, label: trimmed, isCustom: true }]);
    setCustomCards((current) => ({ ...current, [id]: [] }));
    setNewColumnName("");
    setAddingColumn(false);
  }

  function resetForm(column) {
    setFormState({
      title: "",
      ticket: "",
      description: "",
      comment: "",
      team: "",
      startDate: "",
      dueDate: "",
      assignee: "",
      status: column?.isCustom ? STATUSES[0] : column?.id || STATUSES[0],
    });
  }

  function fillFormFromTask(column, task, meta) {
    setFormState({
      title: task.title || "",
      ticket: meta?.ticket || "",
      description: meta?.description || "",
      comment: meta?.comment || "",
      team: meta?.team || "",
      startDate: meta?.startDate || "",
      dueDate: meta?.dueDate || "",
      assignee: meta?.assignee || "",
      status: task.status || column?.id || STATUSES[0],
    });
  }

  async function handleCreateCard(column) {
    const title = formState.title.trim();
    if (!title) return;
    const meta = {
      ticket: formState.ticket.trim(),
      description: formState.description.trim(),
      comment: formState.comment.trim(),
      team: formState.team.trim(),
      startDate: formState.startDate,
      dueDate: formState.dueDate,
      assignee: formState.assignee.trim(),
    };

    if (column.isCustom) {
      const newCard = {
        id: `${column.id}-${Date.now()}`,
        title,
        status: column.id,
        meta,
      };
      setCustomCards((current) => ({
        ...current,
        [column.id]: [
          newCard,
          ...(current[column.id] || []),
        ],
      }));
    } else if (onCreateTask) {
      const created = await onCreateTask(title, formState.status);
      if (created?.id) {
        setTaskMeta((current) => ({ ...current, [created.id]: meta }));
      }
    }

    resetForm(column);
    setOpenComposerId(null);
    setModalOpen(false);
    setModalColumn(null);
    setModalTask(null);
  }

  function openTitleComposer(column) {
    setOpenComposerId(column.id);
    setDraftTitle((current) => ({ ...current, [column.id]: "" }));
  }

  function confirmTitle(column) {
    const title = (draftTitle[column.id] || "").trim();
    if (!title) return;
    setModalMode("create");
    setModalColumn(column);
    setModalTask(null);
    fillFormFromTask(column, { title, status: column.id }, {});
    setModalOpen(true);
    setOpenComposerId(null);
  }

  function cancelTitle() {
    setOpenComposerId(null);
  }

  function openEditModal(column, task, meta) {
    setModalMode("edit");
    setModalColumn(column);
    setModalTask(task);
    fillFormFromTask(column, task, meta);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalColumn(null);
    setModalTask(null);
    resetForm(null);
  }

  async function saveEditCard(column, task) {
    const title = formState.title.trim();
    if (!title) return;
    const meta = {
      ticket: formState.ticket.trim(),
      description: formState.description.trim(),
      comment: formState.comment.trim(),
      team: formState.team.trim(),
      startDate: formState.startDate,
      dueDate: formState.dueDate,
      assignee: formState.assignee.trim(),
    };

    if (column.isCustom) {
      setCustomCards((current) => ({
        ...current,
        [column.id]: (current[column.id] || []).map((item) =>
          item.id === task.id ? { ...item, title, meta } : item
        ),
      }));
    } else if (onUpdateTask) {
      await onUpdateTask(task.id, { title, status: formState.status });
      setTaskMeta((current) => ({ ...current, [task.id]: meta }));
    }

    resetForm(column);
    setModalOpen(false);
    setModalColumn(null);
    setModalTask(null);
  }

  return (
    <div>
      {showDashboard ? <Dashboard tasks={tasks} /> : null}
      {showList ? <List tasks={tasks} /> : null}
      {showTimeline ? <Timeline tasks={tasks} /> : null}
      {showBoard ? (
        <div>
          <div className="mb-3 flex items-center gap-2">
            {addingColumn ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(event) => setNewColumnName(event.target.value)}
                  placeholder="Nome da coluna"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddColumn}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingColumn(false);
                    setNewColumnName("");
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingColumn(true)}
                className="rounded-lg border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-600"
              >
                + Criar coluna
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {boardColumns.map((column) => {
              const columnTasks = column.isCustom
                ? customCards[column.id] || []
                : columns[column.id] || [];

              return (
                <section
                  key={column.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(20,24,36,0.08)]"
                >
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {column.label}
                  </h2>
                  <div className="grid gap-3">
                    {columnTasks.map((task) => {
                      const meta = column.isCustom ? task.meta : taskMeta[task.id];

                      return column.isCustom ? (
                        <article
                          key={task.id}
                          className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-slate-300"
                          onClick={() => openEditModal(column, task, meta)}
                        >
                          <p className="mb-3 font-semibold text-slate-800">
                            {task.title}
                          </p>
                          {meta?.ticket ? (
                            <p className="text-xs text-slate-500">
                              Ticket: {meta.ticket}
                            </p>
                          ) : null}
                          {meta?.assignee ? (
                            <p className="text-xs text-slate-500">
                              Responsavel: {meta.assignee}
                            </p>
                          ) : null}
                          {(meta?.startDate || meta?.dueDate) ? (
                            <p className="text-xs text-slate-500">
                              {meta.startDate ? `Inicio: ${meta.startDate}` : ""}
                              {meta.startDate && meta.dueDate ? " - " : ""}
                              {meta.dueDate ? `Limite: ${meta.dueDate}` : ""}
                            </p>
                          ) : null}
                        </article>
                      ) : (
                        <article
                          key={task.id}
                          className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-slate-300"
                          onClick={() => openEditModal(column, task, meta)}
                        >
                          <p className="mb-3 font-semibold text-slate-800">
                            {task.title}
                          </p>
                          {meta?.ticket ? (
                            <p className="text-xs text-slate-500">
                              Ticket: {meta.ticket}
                            </p>
                          ) : null}
                          {meta?.assignee ? (
                            <p className="text-xs text-slate-500">
                              Responsavel: {meta.assignee}
                            </p>
                          ) : null}
                          {(meta?.startDate || meta?.dueDate) ? (
                            <p className="text-xs text-slate-500">
                              {meta.startDate ? `Inicio: ${meta.startDate}` : ""}
                              {meta.startDate && meta.dueDate ? " - " : ""}
                              {meta.dueDate ? `Limite: ${meta.dueDate}` : ""}
                            </p>
                          ) : null}
                          <div className="flex items-center gap-2">
                            <select
                              value={task.status}
                              onChange={(event) =>
                                onUpdateTask(task.id, { status: event.target.value })
                              }
                              className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                              onClick={(event) => event.stopPropagation()}
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
                              onClick={(event) => {
                                event.stopPropagation();
                                onDeleteTask(task.id);
                              }}
                            >
                              Remover
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  {openComposerId === column.id ? (
                    <div className="mt-3 rounded-xl border border-blue-600 bg-white p-3">
                      <input
                        type="text"
                        placeholder="O que precisa ser feito?"
                        value={draftTitle[column.id] || ""}
                        onChange={(event) =>
                          setDraftTitle((current) => ({
                            ...current,
                            [column.id]: event.target.value,
                          }))
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            confirmTitle(column);
                          }
                          if (event.key === "Escape") {
                            cancelTitle();
                          }
                        }}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                      <div className="mt-3 flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded-md border border-slate-200 px-2 py-1">
                            Checklist
                          </span>
                          <span className="rounded-md border border-slate-200 px-2 py-1">
                            Data
                          </span>
                          <span className="rounded-md border border-slate-200 px-2 py-1">
                            Pessoa
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => confirmTitle(column)}
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600"
                        >
                          Enter
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => confirmTitle(column)}
                          className="rounded-lg bg-slate-900 px-3 py-1 text-sm font-semibold text-white"
                        >
                          Continuar
                        </button>
                        <button
                          type="button"
                          onClick={cancelTitle}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openTitleComposer(column)}
                      className="mt-3 text-sm font-semibold text-blue-600"
                    >
                      + Criar card
                    </button>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      ) : null}
      {modalOpen && modalColumn ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={closeModal}
        >
          <div
            className="h-[80vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-purple-500">DEV</span>
                <span>
                  {formState.ticket || modalTask?.id
                    ? formState.ticket || `DEV-${modalTask?.id}`
                    : "Novo"}
                </span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600"
              >
                Fechar
              </button>
            </div>
            <div className="grid h-full grid-cols-1 gap-0 lg:grid-cols-[2fr_1fr]">
              <div className="h-full overflow-y-auto px-6 py-5">
                <input
                  type="text"
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Titulo do card"
                  className="w-full text-2xl font-semibold text-slate-800 outline-none"
                />
                <div className="mt-4 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">
                      Descricao
                    </h3>
                    <textarea
                      value={formState.description}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Editar descricao"
                      rows={4}
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">
                      Comentario
                    </h3>
                    <textarea
                      value={formState.comment}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          comment: event.target.value,
                        }))
                      }
                      placeholder="Adicionar comentario"
                      rows={3}
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              <aside className="h-full overflow-y-auto border-l border-slate-200 bg-slate-50 px-6 py-5">
                <div className="mb-4 text-sm font-semibold text-slate-600">
                  Informacoes
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs text-slate-500">Ticket</label>
                    <input
                      type="text"
                      value={formState.ticket}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          ticket: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  {!modalColumn.isCustom ? (
                    <div>
                      <label className="text-xs text-slate-500">Status</label>
                      <select
                        value={formState.status}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            status: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {STATUSES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <div>
                    <label className="text-xs text-slate-500">Responsavel</label>
                    <input
                      type="text"
                      value={formState.assignee}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          assignee: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Team</label>
                    <input
                      type="text"
                      value={formState.team}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          team: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-500">Data inicio</label>
                      <input
                        type="date"
                        value={formState.startDate}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            startDate: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Data limite</label>
                      <input
                        type="date"
                        value={formState.dueDate}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            dueDate: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      modalMode === "create"
                        ? handleCreateCard(modalColumn)
                        : saveEditCard(modalColumn, modalTask)
                    }
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                  >
                    {modalMode === "create" ? "Criar" : "Salvar"}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}




