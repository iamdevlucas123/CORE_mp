import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool, initDb } from "./db.js";
import { STATUSES } from "@core/shared";

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/tasks", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, title, status, created_at FROM tasks ORDER BY id DESC"
  );
  res.json(rows);
});

app.post("/api/tasks", async (req, res) => {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const status = STATUSES.includes(req.body.status) ? req.body.status : "todo";

  if (!title) {
    return res.status(400).send("Titulo obrigatorio");
  }

  const [result] = await pool.query(
    "INSERT INTO tasks (title, status) VALUES (?, ?)",
    [title, status]
  );

  const [rows] = await pool.query(
    "SELECT id, title, status, created_at FROM tasks WHERE id = ?",
    [result.insertId]
  );

  res.status(201).json(rows[0]);
});

app.patch("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).send("ID invalido");
  }

  const title =
    typeof req.body.title === "string" ? req.body.title.trim() : undefined;
  const status = STATUSES.includes(req.body.status)
    ? req.body.status
    : undefined;

  if (!title && !status) {
    return res.status(400).send("Nada para atualizar");
  }

  if (title) {
    await pool.query("UPDATE tasks SET title = ? WHERE id = ?", [title, id]);
  }

  if (status) {
    await pool.query("UPDATE tasks SET status = ? WHERE id = ?", [status, id]);
  }

  const [rows] = await pool.query(
    "SELECT id, title, status, created_at FROM tasks WHERE id = ?",
    [id]
  );

  res.json(rows[0]);
});

app.delete("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).send("ID invalido");
  }

  await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
  res.status(204).end();
});

async function start() {
  try {
    await initDb();
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start API", err);
    process.exit(1);
  }
}

start();