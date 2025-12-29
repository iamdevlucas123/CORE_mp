import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

async function ensureProjectAccess(projectId, userId) {
  const [access] = await pool.query(
    `
      SELECT 1
      FROM projects p
      JOIN space_members sm ON sm.space_id = p.space_id
      WHERE p.id = ? AND sm.user_id = ?
    `,
    [projectId, userId]
  );
  return access.length > 0;
}

router.get("/projects/:projectId/columns", async (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!Number.isInteger(projectId)) {
    return res.status(400).send("ID invalido");
  }
  const hasAccess = await ensureProjectAccess(projectId, req.user.id);
  if (!hasAccess) {
    return res.status(403).send("Sem acesso ao projeto");
  }
  const [rows] = await pool.query(
    "SELECT id, name, position, created_at FROM columns WHERE project_id = ? ORDER BY position ASC",
    [projectId]
  );
  res.json(rows);
});

router.post("/projects/:projectId/columns", async (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!Number.isInteger(projectId)) {
    return res.status(400).send("ID invalido");
  }
  const hasAccess = await ensureProjectAccess(projectId, req.user.id);
  if (!hasAccess) {
    return res.status(403).send("Sem acesso ao projeto");
  }
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const position = Number.isInteger(req.body.position)
    ? req.body.position
    : 0;
  if (!name) {
    return res.status(400).send("Nome obrigatorio");
  }
  const [result] = await pool.query(
    "INSERT INTO columns (project_id, name, position) VALUES (?, ?, ?)",
    [projectId, name, position]
  );
  const [rows] = await pool.query(
    "SELECT id, name, position, created_at FROM columns WHERE id = ?",
    [result.insertId]
  );
  res.status(201).json(rows[0]);
});

router.get("/projects/:projectId/tasks", async (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!Number.isInteger(projectId)) {
    return res.status(400).send("ID invalido");
  }
  const hasAccess = await ensureProjectAccess(projectId, req.user.id);
  if (!hasAccess) {
    return res.status(403).send("Sem acesso ao projeto");
  }
  const columnId = req.query.column_id ? Number(req.query.column_id) : null;
  const params = [projectId];
  let filter = "WHERE t.project_id = ?";
  if (Number.isInteger(columnId)) {
    filter += " AND t.column_id = ?";
    params.push(columnId);
  }
  const [rows] = await pool.query(
    `
      SELECT t.*, c.name AS column_name
      FROM tasks t
      JOIN columns c ON c.id = t.column_id
      ${filter}
      ORDER BY t.id DESC
    `,
    params
  );
  res.json(rows);
});

router.post("/projects/:projectId/tasks", async (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!Number.isInteger(projectId)) {
    return res.status(400).send("ID invalido");
  }
  const hasAccess = await ensureProjectAccess(projectId, req.user.id);
  if (!hasAccess) {
    return res.status(403).send("Sem acesso ao projeto");
  }
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const columnId = Number(req.body.column_id);
  if (!title) {
    return res.status(400).send("Titulo obrigatorio");
  }
  if (!Number.isInteger(columnId)) {
    return res.status(400).send("Coluna invalida");
  }
  const [result] = await pool.query(
    `
      INSERT INTO tasks
        (project_id, column_id, title, description, ticket, team, assignee, start_date, due_date, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      projectId,
      columnId,
      title,
      req.body.description || null,
      req.body.ticket || null,
      req.body.team || null,
      req.body.assignee || null,
      req.body.start_date || null,
      req.body.due_date || null,
      req.body.priority || "medium",
    ]
  );
  const [rows] = await pool.query(
    `
      SELECT t.*, c.name AS column_name
      FROM tasks t
      JOIN columns c ON c.id = t.column_id
      WHERE t.id = ?
    `,
    [result.insertId]
  );
  res.status(201).json(rows[0]);
});

export default router;
