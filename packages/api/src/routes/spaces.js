import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/spaces", async (req, res) => {
  const spaces = await prisma.space.findMany({
    where: {
      members: {
        some: { userId: req.user.id },
      },
    },
    orderBy: { id: "asc" },
    select: { id: true, name: true, createdAt: true },
  });
  res.json(
    spaces.map((space) => ({
      id: space.id,
      name: space.name,
      created_at: space.createdAt,
    }))
  );
});

router.post("/spaces", async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    return res.status(400).send("Nome obrigatorio");
  }
  const space = await prisma.space.create({
    data: {
      name,
      members: {
        create: {
          userId: req.user.id,
          role: "owner",
        },
      },
    },
    select: { id: true, name: true, createdAt: true },
  });
  res.status(201).json({
    id: space.id,
    name: space.name,
    created_at: space.createdAt,
  });
});

router.get("/spaces/:spaceId/projects", async (req, res) => {
  const spaceId = Number(req.params.spaceId);
  if (!Number.isInteger(spaceId)) {
    return res.status(400).send("ID invalido");
  }
  const membership = await prisma.spaceMember.findFirst({
    where: { spaceId, userId: req.user.id },
    select: { id: true },
  });
  if (!membership) {
    return res.status(403).send("Sem acesso ao espaco");
  }
  const projects = await prisma.project.findMany({
    where: { spaceId },
    orderBy: { id: "asc" },
    select: { id: true, name: true, createdAt: true },
  });
  res.json(
    projects.map((project) => ({
      id: project.id,
      name: project.name,
      created_at: project.createdAt,
    }))
  );
});

router.post("/spaces/:spaceId/projects", async (req, res) => {
  const spaceId = Number(req.params.spaceId);
  if (!Number.isInteger(spaceId)) {
    return res.status(400).send("ID invalido");
  }
  const membership = await prisma.spaceMember.findFirst({
    where: { spaceId, userId: req.user.id },
    select: { id: true },
  });
  if (!membership) {
    return res.status(403).send("Sem acesso ao espaco");
  }
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    return res.status(400).send("Nome obrigatorio");
  }
  const project = await prisma.project.create({
    data: { spaceId, name },
    select: { id: true, name: true, createdAt: true },
  });
  res.status(201).json({
    id: project.id,
    name: project.name,
    created_at: project.createdAt,
  });
});

export default router;