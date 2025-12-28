import { useEffect, useMemo, useState } from "react";
import { STATUSES } from "@core/shared";
import Board from "./components/Board.jsx";
import ContentHeader from "./components/ContentHeader.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Tabs from "./components/Tabs.jsx";
import Topbar from "./components/Topbar.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState(STATUSES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(STATUSES.map((s) => [s, []]));
    for (const task of tasks) {
      const key = grouped[task.status] ? task.status : STATUSES[0];
      grouped[key].push(task);
    }
    return grouped;
  }, [tasks]);

  async function loadTasks() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/tasks`);
      if (!res.ok) throw new Error("Falha ao buscar tarefas");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function createTask(event) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const res = await fetch(`${API_BASE}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed, status }),
    });

    if (res.ok) {
      const created = await res.json();
      setTasks((current) => [created, ...current]);
      setTitle("");
      setStatus(STATUSES[0]);
      return;
    }

    const msg = await res.text();
    setError(msg || "Erro ao criar tarefa");
  }

  async function updateTask(id, nextStatus) {
    const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!res.ok) {
      const msg = await res.text();
      setError(msg || "Erro ao atualizar tarefa");
      return;
    }

    const updated = await res.json();
    setTasks((current) =>
      current.map((task) => (task.id === id ? updated : task))
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

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />

      <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Sidebar />

        <main className="min-w-0 px-6 py-6 md:px-8 md:py-8">
          <ContentHeader loading={loading} onReload={loadTasks} />
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
          />
        </main>
      </div>
    </div>
  );
}
