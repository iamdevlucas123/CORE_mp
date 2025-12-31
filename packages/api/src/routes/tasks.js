import { Router } from "express";
import { STATUSES } from "@core/shared";
import { prisma, getDefaultContext } from "../db.js";

const router = Router();

function mapTaskListItem(task) {
  return {
    id: task.id,
    title: task.title,
    status: task.column?.name || null,
    created_at: task.createdAt,
  };
}

function toDate(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return new Date(trimmed);
}

router.get("/tasks", async (req, res) => {
  const { projectId } = await getDefaultContext(req.user.id);
  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { id: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      column: { select: { name: true } },
    },
  });
  res.json(tasks.map(mapTaskListItem));
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

  const task = await prisma.task.create({
    data: {
      projectId,
      columnId: column.id,
      title,
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      column: { select: { name: true } },
    },
  });

  res.status(201).json(mapTaskListItem(task));
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

  const data = {};

  if (title) {
    data.title = title;
  }

  if (status) {
    const { columnByName } = await getDefaultContext(req.user.id);
    const column = columnByName[status];
    if (!column) {
      return res.status(400).send("Status invalido");
    }
    data.columnId = column.id;
  } else if (Number.isInteger(columnId)) {
    data.columnId = columnId;
  }

  if (description !== undefined) {
    data.description = description || null;
  }
  if (ticket !== undefined) {
    data.ticket = ticket || null;
  }
  if (team !== undefined) {
    data.team = team || null;
  }
  if (assignee !== undefined) {
    data.assignee = assignee || null;
  }
  if (startDate !== undefined) {
    data.startDate = toDate(startDate);
  }
  if (dueDate !== undefined) {
    data.dueDate = toDate(dueDate);
  }
  if (priority) {
    data.priority = priority;
  }

  if (Object.keys(data).length) {
    await prisma.task.update({
      where: { id },
      data,
    });
  }

  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      createdAt: true,
      column: { select: { name: true } },
    },
  });

  res.json(mapTaskListItem(task));
});

router.delete("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).send("ID invalido");
  }

  await prisma.task.deleteMany({ where: { id } });
  res.status(204).end();
});

export default router;