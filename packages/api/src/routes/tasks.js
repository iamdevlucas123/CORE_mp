import { Router } from "express";
import { STATUSES } from "@core/shared";
import { pool, getDefaultContext } from "../db.js";

const router = Router();

router.get("/tasks", async (req, res) => {
  const { projectId } = await getDefaultContext(req.user.id);
  const [rows] = await pool.query(
    `
      SELECT t.id, t.title, c.name AS status, t.created_at
      FROM tasks t
      JOIN columns c ON c.id = t.column_id
      WHERE t.project_id = ?
      ORDER BY t.id DESC
    `,
    [projectId]
  );
  res.json(rows);
});

router.post("/tasks", async (req, res) => {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const status = STATUSES.includes(req.body.status) ? req.body.status : "todo";

  if (!title) {
    return res.status(400).send("Titulo obrigatorio");
  }

  const { projectId, columnByName } = await getDefaultContext(req.user.id);
  const column = columnByName[status];
  if (!column) {
    return res.status(400).send("Status invalido");
  }

  const [result] = await pool.query(
    "INSERT INTO tasks (project_id, column_id, title) VALUES (?, ?, ?)",
    [projectId, column.id, title]
  );

  const [rows] = await pool.query(
    `
      SELECT t.id, t.title, c.name AS status, t.created_at
      FROM tasks t
      JOIN columns c ON c.id = t.column_id
      WHERE t.id = ?
    `,
    [result.insertId]
  );

  res.status(201).json(rows[0]);
});

router.patch("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).send("ID invalido");
  }

  const title =
    typeof req.body.title === "string" ? req.body.title.trim() : undefined;
  const status = STATUSES.includes(req.body.status)
    ? req.body.status
    : undefined;
  const columnId = Number.isInteger(req.body.column_id)
    ? req.body.column_id
    : undefined;
  const priority = ["low", "medium", "high"].includes(req.body.priority)
    ? req.body.priority
    : undefined;
  const description =
    typeof req.body.description === "string" ? req.body.description : undefined;
  const ticket =
    typeof req.body.ticket === "string" ? req.body.ticket : undefined;
  const team = typeof req.body.team === "string" ? req.body.team : undefined;
  const assignee =
    typeof req.body.assignee === "string" ? req.body.assignee : undefined;
  const startDate =
    typeof req.body.start_date === "string" ? req.body.start_date : undefined;
  const dueDate =
    typeof req.body.due_date === "string" ? req.body.due_date : undefined;

  if (
    !title &&
    !status &&
    !Number.isInteger(columnId) &&
    !priority &&
    description === undefined &&
    ticket === undefined &&
    team === undefined &&
    assignee === undefined &&
    startDate === undefined &&
    dueDate === undefined
  ) {
    return res.status(400).send("Nada para atualizar");
  }

  const fields = [];
  const values = [];

  if (title) {
    fields.push("title = ?");
    values.push(title);
  }

  if (status) {
    const { columnByName } = await getDefaultContext(req.user.id);
    const column = columnByName[status];
    if (!column) {
      return res.status(400).send("Status invalido");
    }
    fields.push("column_id = ?");
    values.push(column.id);
  } else if (Number.isInteger(columnId)) {
    fields.push("column_id = ?");
    values.push(columnId);
  }

  if (description !== undefined) {
    fields.push("description = ?");
    values.push(description || null);
  }
  if (ticket !== undefined) {
    fields.push("ticket = ?");
    values.push(ticket || null);
  }
  if (team !== undefined) {
    fields.push("team = ?");
    values.push(team || null);
  }
  if (assignee !== undefined) {
    fields.push("assignee = ?");
    values.push(assignee || null);
  }
  if (startDate !== undefined) {
    fields.push("start_date = ?");
    values.push(startDate || null);
  }
  if (dueDate !== undefined) {
    fields.push("due_date = ?");
    values.push(dueDate || null);
  }
  if (priority) {
    fields.push("priority = ?");
    values.push(priority);
  }

  if (fields.length) {
    values.push(id);
    await pool.query(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`, values);
  }

  const [rows] = await pool.query(
    `
      SELECT t.id, t.title, c.name AS status, t.created_at
      FROM tasks t
      JOIN columns c ON c.id = t.column_id
      WHERE t.id = ?
    `,
    [id]
  );

  res.json(rows[0]);
});

router.delete("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).send("ID invalido");
  }

  await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
  res.status(204).end();
});

export default router;
