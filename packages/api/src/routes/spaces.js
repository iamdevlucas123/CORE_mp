import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/spaces", async (req, res) => {
  const [rows] = await pool.query(
    `
      SELECT s.id, s.name, s.created_at
      FROM spaces s
      JOIN space_members sm ON sm.space_id = s.id
      WHERE sm.user_id = ?
      ORDER BY s.id ASC
    `,
    [req.user.id]
  );
  res.json(rows);
});

router.post("/spaces", async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    return res.status(400).send("Nome obrigatorio");
  }
  const [result] = await pool.query("INSERT INTO spaces (name) VALUES (?)", [
    name,
  ]);
  await pool.query(
    "INSERT INTO space_members (space_id, user_id, role) VALUES (?, ?, 'owner')",
    [result.insertId, req.user.id]
  );
  const [rows] = await pool.query(
    "SELECT id, name, created_at FROM spaces WHERE id = ?",
    [result.insertId]
  );
  res.status(201).json(rows[0]);
});

router.get("/spaces/:spaceId/projects", async (req, res) => {
  const spaceId = Number(req.params.spaceId);
  if (!Number.isInteger(spaceId)) {
    return res.status(400).send("ID invalido");
  }
  const [access] = await pool.query(
    "SELECT 1 FROM space_members WHERE space_id = ? AND user_id = ?",
    [spaceId, req.user.id]
  );
  if (!access.length) {
    return res.status(403).send("Sem acesso ao espaco");
  }
  const [rows] = await pool.query(
    "SELECT id, name, created_at FROM projects WHERE space_id = ? ORDER BY id ASC",
    [spaceId]
  );
  res.json(rows);
});

router.post("/spaces/:spaceId/projects", async (req, res) => {
  const spaceId = Number(req.params.spaceId);
  if (!Number.isInteger(spaceId)) {
    return res.status(400).send("ID invalido");
  }
  const [access] = await pool.query(
    "SELECT 1 FROM space_members WHERE space_id = ? AND user_id = ?",
    [spaceId, req.user.id]
  );
  if (!access.length) {
    return res.status(403).send("Sem acesso ao espaco");
  }
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    return res.status(400).send("Nome obrigatorio");
  }
  const [result] = await pool.query(
    "INSERT INTO projects (space_id, name) VALUES (?, ?)",
    [spaceId, name]
  );
  const [rows] = await pool.query(
    "SELECT id, name, created_at FROM projects WHERE id = ?",
    [result.insertId]
  );
  res.status(201).json(rows[0]);
});

export default router;
