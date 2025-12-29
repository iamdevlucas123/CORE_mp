import { useEffect, useMemo, useState } from "react";
import { STATUSES } from "@core/shared";
import Board from "./components/Board.jsx";
import ContentHeader from "./components/ContentHeader.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Tabs from "./components/Tabs.jsx";
import Topbar from "./components/Topbar.jsx";
import useSpaceStore from "./store/spaceStore.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [columnsByName, setColumnsByName] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentSpace = useSpaceStore((state) => state.currentSpace);

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(STATUSES.map((s) => [s, []]));
    for (const task of tasks) {
      const key = grouped[task.status] ? task.status : STATUSES[0];
      grouped[key].push(task);
    }
    return grouped;
  }, [tasks]);

  async function loadTasks(projectId = currentProject?.id) {
    if (!projectId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/tasks`);
      if (!res.ok) throw new Error("Falha ao buscar tarefas");
      const data = await res.json();
      const normalized = data.map((task) => ({
        ...task,
        status: task.column_name || task.status,
      }));
      setTasks(normalized);
    } catch (err) {
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function createTaskForBoard(titleValue, statusValue) {
    if (!currentProject?.id) return null;
    const trimmed = titleValue.trim();
    if (!trimmed) return;
    const column = columnsByName[statusValue];
    if (!column) {
      setError("Coluna invalida");
      return null;
    }

    const res = await fetch(
      `${API_BASE}/api/projects/${currentProject.id}/tasks`,
      {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmed,
          column_id: column.id,
        }),
      }
    );

    if (res.ok) {
      const created = await res.json();
      setTasks((current) => [
        {
          ...created,
          status: created.column_name || created.status,
        },
        ...current,
      ]);
      return created;
    }

    const msg = await res.text();
    setError(msg || "Erro ao criar tarefa");
    return null;
  }

  async function updateTask(id, updates) {
    const payload = {};
    if (typeof updates?.title === "string") {
      const trimmed = updates.title.trim();
      if (trimmed) payload.title = trimmed;
    }
    if (STATUSES.includes(updates?.status)) {
      const column = columnsByName[updates.status];
      if (column) payload.column_id = column.id;
    }
    if (!Object.keys(payload).length) return;

    const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.text();
      setError(msg || "Erro ao atualizar tarefa");
      return;
    }

    const updated = await res.json();
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...updated,
              status: updated.column_name || updated.status || updates.status,
            }
          : task
      )
    );
  }

  async function deleteTask(id) {
    const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const msg = await res.text();
      setError(msg || "Erro ao remover tarefa");
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== id));
  }

  async function loadProjectForSpace(spaceId) {
    setLoading(true);
    setError("");
    setTasks([]);
    try {
      const projectsRes = await fetch(
        `${API_BASE}/api/spaces/${spaceId}/projects`
      );
      if (!projectsRes.ok) throw new Error("Falha ao buscar projetos");
      const projects = await projectsRes.json();
      const project = projects[0] || null;
      setCurrentProject(project);
      if (!project) {
        setColumnsByName({});
        setTasks([]);
        return;
      }
      const columnsRes = await fetch(
        `${API_BASE}/api/projects/${project.id}/columns`
      );
      if (!columnsRes.ok) throw new Error("Falha ao buscar colunas");
      const columns = await columnsRes.json();
      const map = Object.fromEntries(columns.map((col) => [col.name, col]));
      setColumnsByName(map);
      await loadTasks(project.id);
    } catch (err) {
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentSpace?.id) {
      loadProjectForSpace(currentSpace.id);
    }
  }, [currentSpace?.id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />

      <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Sidebar />

        <main className="min-w-0 px-6 py-6 md:px-8 md:py-8">
          <ContentHeader loading={loading} onReload={() => loadTasks()} />
          <Tabs />

          {error ? (
            <div className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}
          {loading ? <div className="mb-4 text-sm text-slate-500">Carregando...</div> : null}

          <Board
            tasks={tasks}
            columns={columns}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onCreateTask={createTaskForBoard}
          />
        </main>
      </div>
    </div>
  );
}
