import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

function toDate(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return new Date(trimmed);
}

function mapProjectTask(task) {
  return {
    id: task.id,
    project_id: task.projectId,
    column_id: task.columnId,
    title: task.title,
    description: task.description,
    ticket: task.ticket,
    team: task.team,
    assignee: task.assignee,
    start_date: task.startDate,
    due_date: task.dueDate,
    priority: task.priority,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    column_name: task.column?.name || null,
  };
}

async function ensureProjectAccess(projectId, userId) {
  const access = await prisma.project.findFirst({
    where: {
      id: projectId,
      space: {
        members: {
          some: { userId },
        },
      },
    },
    select: { id: true },
  });
  return Boolean(access);
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
  const columns = await prisma.column.findMany({
    where: { projectId },
    orderBy: { position: "asc" },
    select: { id: true, name: true, position: true, createdAt: true },
  });
  res.json(
    columns.map((column) => ({
      id: column.id,
      name: column.name,
      position: column.position,
      created_at: column.createdAt,
    }))
  );
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
  const column = await prisma.column.create({
    data: { projectId, name, position },
    select: { id: true, name: true, position: true, createdAt: true },
  });
  res.status(201).json({
    id: column.id,
    name: column.name,
    position: column.position,
    created_at: column.createdAt,
  });
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
  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      ...(Number.isInteger(columnId) ? { columnId } : {}),
    },
    orderBy: { id: "desc" },
    include: { column: { select: { name: true } } },
  });
  res.json(tasks.map(mapProjectTask));
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
  const task = await prisma.task.create({
    data: {
      projectId,
      columnId,
      title,
      description: req.body.description || null,
      ticket: req.body.ticket || null,
      team: req.body.team || null,
      assignee: req.body.assignee || null,
      startDate: toDate(req.body.start_date),
      dueDate: toDate(req.body.due_date),
      priority: req.body.priority || "medium",
    },
    include: { column: { select: { name: true } } },
  });

  res.status(201).json(mapProjectTask(task));
});

export default router;