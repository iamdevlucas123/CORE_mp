import "dotenv/config";
import { runMigrations } from "./db.js";

try {
  await runMigrations();
  console.log("Migrations applied.");
  process.exit(0);
} catch (err) {
  console.error("Migration failed.", err);
  process.exit(1);
}
