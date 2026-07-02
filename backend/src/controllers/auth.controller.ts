import type { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { query } from "../db";
import { HttpError } from "../utils/httpError";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthRequest } from "../middleware/auth";
import type { AdminRow } from "../types";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { username, password } = loginSchema.parse(req.body);

  const result = await query<AdminRow>(
    "SELECT id, username, password_hash, village, created_at FROM admins WHERE username = $1",
    [username],
  );
  const admin = result.rows[0];

  // Compare even when the admin is missing to avoid leaking which usernames exist.
  const hash = admin?.password_hash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinv";
  const ok = await bcrypt.compare(password, hash);
  if (!admin || !ok) {
    throw new HttpError(401, "Invalid username or password");
  }

  const token = jwt.sign(
    { sub: admin.id, username: admin.username, village: admin.village },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
  );

  res.json({
    token,
    admin: { id: admin.id, username: admin.username, village: admin.village },
  });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.admin) {
    throw new HttpError(401, "Not authenticated");
  }
  res.json({ admin: req.admin });
});
