import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError";

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}

// Express identifies error middleware by its 4-arg signature, so `next` must stay.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", details: err.flatten() });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Postgres unique-violation -> conflict
  if (typeof err === "object" && err !== null && (err as { code?: string }).code === "23505") {
    res.status(409).json({ error: "Resource already exists" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
