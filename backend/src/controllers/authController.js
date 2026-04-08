import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { fail, ok } from "../utils/response.js";

function comparePassword(input, stored) {
  return input === stored;
}

export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return fail(res, "Username and password are required", 400);
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1",
      [username]
    );

    if (!rows.length || !comparePassword(password, rows[0].password_hash)) {
      return fail(res, "Invalid credentials", 401);
    }

    const token = jwt.sign(
      { id: rows[0].id, username: rows[0].username },
      process.env.JWT_SECRET || "replace-this-secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return ok(
      res,
      {
        token,
        user: {
          id: rows[0].id,
          username: rows[0].username
        }
      },
      "Login successful"
    );
  } catch (error) {
    return fail(res, error.message);
  }
}
