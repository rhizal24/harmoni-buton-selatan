import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { isVillage } from "../constants/villages";
import { HttpError } from "../utils/httpError";
import type { AuthAdmin } from "../types";

export interface AuthRequest extends Request {
  admin?: AuthAdmin;
}

interface TokenPayload {
  sub: number;
  username: string;
  village: string;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing or malformed Authorization header");
  }

  const token = header.slice("Bearer ".length).trim();

  let decoded: unknown;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }

  const payload = decoded as Partial<TokenPayload>;
  if (
    typeof payload.sub !== "number" ||
    typeof payload.username !== "string" ||
    !isVillage(payload.village)
  ) {
    throw new HttpError(401, "Invalid token payload");
  }

  req.admin = { id: payload.sub, username: payload.username, village: payload.village };
  next();
}
