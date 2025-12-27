import { useEffect, useMemo, useState } from "react";
import { STATUSES } from "@core/shared";
import "./App.css";

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
    <div className="page">
      <header className="header">
        <div>
          <h1>Kanban</h1>
          <p>Simple board with API + MySQL</p>
        </div>
        <button className="ghost" onClick={loadTasks} disabled={loading}>
          Recarregar
        </button>
      </header>

      <form className="composer" onSubmit={createTask}>
        <input
          type="text"
          placeholder="Nova tarefa"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button type="submit">Adicionar</button>
      </form>

      {error ? <div className="error">{error}</div> : null}
      {loading ? <div className="loading">Carregando...</div> : null}

      <div className="board">
        {STATUSES.map((column) => (
          <section key={column} className="column">
            <h2>{column}</h2>
            <div className="cards">
              {columns[column].map((task) => (
                <article key={task.id} className="card">
                  <p>{task.title}</p>
                  <div className="actions">
                    <select
                      value={task.status}
                      onChange={(event) => updateTask(task.id, event.target.value)}
                    >
                      {STATUSES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <button
                      className="danger"
                      type="button"
                      onClick={() => deleteTask(task.id)}
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
    </div>
  );
}