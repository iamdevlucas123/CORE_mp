import { getOrCreateUser } from "../db.js";

export default async function attachUser(req, res, next) {
  try {
    const userId = Number(req.header("x-user-id"));
    const email = req.header("x-user-email") || "demo@local";
    const user = await getOrCreateUser({
      id: Number.isInteger(userId) ? userId : undefined,
      email,
    });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
