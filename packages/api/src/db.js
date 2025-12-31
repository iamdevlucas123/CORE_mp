import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function mapUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.createdAt,
  };
}

async function getOrCreateUser({ id, email }) {
  let user = null;

  if (Number.isInteger(id)) {
    user = await prisma.user.findUnique({ where: { id } });
  }

  if (!user && email) {
    user = await prisma.user.findUnique({ where: { email } });
  }

  if (!user) {
    const resolvedEmail = email || `demo-${Date.now()}@local`;
    user = await prisma.user.create({
      data: {
        email: resolvedEmail,
        name: "Demo User",
      },
    });
  }

  return mapUser(user);
}

async function getDefaultContext(userId) {
  const existingSpace = await prisma.space.findFirst({
    where: {
      members: {
        some: { userId },
      },
    },
    orderBy: { id: "asc" },
    select: { id: true },
  });

  let spaceId = existingSpace?.id;

  if (!spaceId) {
    const createdSpace = await prisma.space.create({
      data: {
        name: "Meu espaco",
        members: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
      select: { id: true },
    });
    spaceId = createdSpace.id;
  }

  const existingProject = await prisma.project.findFirst({
    where: { spaceId },
    orderBy: { id: "asc" },
    select: { id: true },
  });

  let projectId = existingProject?.id;

  if (!projectId) {
    const createdProject = await prisma.project.create({
      data: {
        spaceId,
        name: "Projeto principal",
      },
      select: { id: true },
    });
    projectId = createdProject.id;
  }

  const existingColumns = await prisma.column.findMany({
    where: { projectId },
    orderBy: { position: "asc" },
    select: { id: true, name: true, position: true },
  });

  if (!existingColumns.length) {
    const defaults = [
      { name: "todo", position: 1 },
      { name: "doing", position: 2 },
      { name: "done", position: 3 },
    ];
    await prisma.column.createMany({
      data: defaults.map((column) => ({
        projectId,
        name: column.name,
        position: column.position,
      })),
    });
  }

  const columns = await prisma.column.findMany({
    where: { projectId },
    orderBy: { position: "asc" },
    select: { id: true, name: true, position: true },
  });

  const columnByName = Object.fromEntries(
    columns.map((column) => [column.name, column])
  );

  return { spaceId, projectId, columns, columnByName };
}

async function initDb() {
  await prisma.$connect();
}

export { prisma, initDb, getDefaultContext, getOrCreateUser };