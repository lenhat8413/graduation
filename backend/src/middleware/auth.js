import jwt from "jsonwebtoken";
import { fail } from "../utils/response.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return fail(res, "Unauthorized", 401);
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "replace-this-secret");
    req.user = payload;
    return next();
  } catch (error) {
    return fail(res, "Invalid token", 401);
  }
}
