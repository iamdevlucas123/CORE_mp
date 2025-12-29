import mysql from "mysql2/promise";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "..", "migrations");

async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const [rows] = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE name = ? LIMIT 1",
      [file]
    );
    if (rows.length) continue;

    const sql = await readFile(path.join(migrationsDir, file), "utf8");
    await pool.query(sql);
    await pool.query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
  }
}

async function getOrCreateUser({ id, email }) {
  if (Number.isInteger(id)) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length) return rows[0];
  }
  if (email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length) return rows[0];
  }
  const resolvedEmail = email || `demo-${Date.now()}@local`;
  const [result] = await pool.query(
    "INSERT INTO users (email, name) VALUES (?, ?)",
    [resolvedEmail, "Demo User"]
  );
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
    result.insertId,
  ]);
  return rows[0];
}

async function getDefaultContext(userId) {
  const [spaces] = await pool.query(
    `
      SELECT s.id
      FROM spaces s
      JOIN space_members sm ON sm.space_id = s.id
      WHERE sm.user_id = ?
      ORDER BY s.id ASC
      LIMIT 1
    `,
    [userId]
  );
  let spaceId = spaces[0]?.id;

  if (!spaceId) {
    const [result] = await pool.query(
      "INSERT INTO spaces (name) VALUES (?)",
      ["Meu espaco"]
    );
    spaceId = result.insertId;
    await pool.query(
      "INSERT INTO space_members (space_id, user_id, role) VALUES (?, ?, 'owner')",
      [spaceId, userId]
    );
  }

  const [projects] = await pool.query(
    "SELECT id FROM projects WHERE space_id = ? ORDER BY id ASC LIMIT 1",
    [spaceId]
  );
  let projectId = projects[0]?.id;

  if (!projectId) {
    const [result] = await pool.query(
      "INSERT INTO projects (space_id, name) VALUES (?, ?)",
      [spaceId, "Projeto principal"]
    );
    projectId = result.insertId;
  }

  const [existingColumns] = await pool.query(
    "SELECT id, name, position FROM columns WHERE project_id = ? ORDER BY position ASC",
    [projectId]
  );

  if (!existingColumns.length) {
    const defaults = [
      { name: "todo", position: 1 },
      { name: "doing", position: 2 },
      { name: "done", position: 3 },
    ];
    for (const column of defaults) {
      await pool.query(
        "INSERT INTO columns (project_id, name, position) VALUES (?, ?, ?)",
        [projectId, column.name, column.position]
      );
    }
  }

  const [columns] = await pool.query(
    "SELECT id, name, position FROM columns WHERE project_id = ? ORDER BY position ASC",
    [projectId]
  );

  const columnByName = Object.fromEntries(
    columns.map((column) => [column.name, column])
  );

  return { spaceId, projectId, columns, columnByName };
}

async function initDb() {
  await runMigrations();
}

export { pool, initDb, runMigrations, getDefaultContext, getOrCreateUser };
