import { Router } from "express";
import { getDefaultContext } from "../db.js";

const router = Router();

router.get("/context", async (req, res) => {
  const context = await getDefaultContext(req.user.id);
  res.json({ ...context, user: req.user });
});

export default router;
