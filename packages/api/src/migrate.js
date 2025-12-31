import { execSync } from "node:child_process";

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("Migrations applied.");
  process.exit(0);
} catch (err) {
  console.error("Migration failed.", err);
  process.exit(1);
}