import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb } from "./db.js";
import attachUser from "./middleware/attachUser.js";
import healthRoutes from "./routes/health.js";
import contextRoutes from "./routes/context.js";
import tasksRoutes from "./routes/tasks.js";
import spacesRoutes from "./routes/spaces.js";
import projectsRoutes from "./routes/projects.js";

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use(attachUser);
app.use("/api", healthRoutes);
app.use("/api", contextRoutes);
app.use("/api", tasksRoutes);
app.use("/api", spacesRoutes);
app.use("/api", projectsRoutes);

async function start() {
  try {
    await initDb();
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start API", err);
    process.exit(1);
  }
}

start();
