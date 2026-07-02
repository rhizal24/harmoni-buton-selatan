import type { Request, Response } from "express";
import { z } from "zod";
import { query } from "../db";
import { HttpError } from "../utils/httpError";
import { asyncHandler } from "../utils/asyncHandler";
import { slugify } from "../utils/slug";
import { isVillage, type Village } from "../constants/villages";
import type { AuthRequest } from "../middleware/auth";
import type { ArticleRow } from "../types";

const PUBLIC_COLUMNS =
  "id, village, title, slug, content, excerpt, cover_image_url, published, author_id, created_at, updated_at";

function requireVillageParam(req: Request): Village {
  const { village } = req.params;
  if (!isVillage(village)) {
    throw new HttpError(404, "Unknown village");
  }
  return village;
}

// Build a slug unique within a village, appending -2, -3, ... on collision.
async function uniqueSlug(village: Village, base: string, ignoreId?: number): Promise<string> {
  const seed = slugify(base) || "artikel";
  let candidate = seed;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await query<{ id: number }>(
      "SELECT id FROM articles WHERE village = $1 AND slug = $2 AND ($3::int IS NULL OR id <> $3)",
      [village, candidate, ignoreId ?? null],
    );
    if (result.rows.length === 0) return candidate;
    n += 1;
    candidate = `${seed}-${n}`;
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  coverImageUrl: z.string().url().max(1000).optional(),
  slug: z.string().max(80).optional(),
  published: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

// ---- Public endpoints (per village, published only) ----

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const village = requireVillageParam(req);
  const result = await query<ArticleRow>(
    `SELECT ${PUBLIC_COLUMNS} FROM articles
     WHERE village = $1 AND published = true
     ORDER BY created_at DESC`,
    [village],
  );
  res.json({ articles: result.rows });
});

export const getPublicBySlug = asyncHandler(async (req: Request, res: Response) => {
  const village = requireVillageParam(req);
  const { slug } = req.params;
  const result = await query<ArticleRow>(
    `SELECT ${PUBLIC_COLUMNS} FROM articles
     WHERE village = $1 AND slug = $2 AND published = true`,
    [village, slug],
  );
  const article = result.rows[0];
  if (!article) {
    throw new HttpError(404, "Article not found");
  }
  res.json({ article });
});

// ---- Admin endpoints (scoped to the authenticated admin's village) ----

function admin(req: AuthRequest) {
  if (!req.admin) throw new HttpError(401, "Not authenticated");
  return req.admin;
}

export const listMine = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { village } = admin(req);
  const result = await query<ArticleRow>(
    `SELECT ${PUBLIC_COLUMNS} FROM articles WHERE village = $1 ORDER BY created_at DESC`,
    [village],
  );
  res.json({ articles: result.rows });
});

export const getMine = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { village } = admin(req);
  const id = Number(req.params.id);
  const result = await query<ArticleRow>(
    `SELECT ${PUBLIC_COLUMNS} FROM articles WHERE id = $1 AND village = $2`,
    [id, village],
  );
  const article = result.rows[0];
  if (!article) throw new HttpError(404, "Article not found");
  res.json({ article });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: adminId, village } = admin(req);
  const body = createSchema.parse(req.body);

  const slug = await uniqueSlug(village, body.slug ?? body.title);

  const result = await query<ArticleRow>(
    `INSERT INTO articles (village, title, slug, content, excerpt, cover_image_url, published, author_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${PUBLIC_COLUMNS}`,
    [
      village,
      body.title,
      slug,
      body.content,
      body.excerpt ?? null,
      body.coverImageUrl ?? null,
      body.published ?? false,
      adminId,
    ],
  );

  res.status(201).json({ article: result.rows[0] });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { village } = admin(req);
  const id = Number(req.params.id);
  const body = updateSchema.parse(req.body);

  const existingResult = await query<ArticleRow>(
    "SELECT id, title FROM articles WHERE id = $1 AND village = $2",
    [id, village],
  );
  const existing = existingResult.rows[0];
  if (!existing) throw new HttpError(404, "Article not found");

  let slug: string | undefined;
  if (body.slug !== undefined || body.title !== undefined) {
    slug = await uniqueSlug(village, body.slug ?? body.title ?? existing.title, id);
  }

  const result = await query<ArticleRow>(
    `UPDATE articles SET
       title = COALESCE($3, title),
       slug = COALESCE($4, slug),
       content = COALESCE($5, content),
       excerpt = COALESCE($6, excerpt),
       cover_image_url = COALESCE($7, cover_image_url),
       published = COALESCE($8, published),
       updated_at = now()
     WHERE id = $1 AND village = $2
     RETURNING ${PUBLIC_COLUMNS}`,
    [
      id,
      village,
      body.title ?? null,
      slug ?? null,
      body.content ?? null,
      body.excerpt ?? null,
      body.coverImageUrl ?? null,
      body.published ?? null,
    ],
  );

  res.json({ article: result.rows[0] });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { village } = admin(req);
  const id = Number(req.params.id);
  const result = await query(
    "DELETE FROM articles WHERE id = $1 AND village = $2 RETURNING id",
    [id, village],
  );
  if (result.rowCount === 0) throw new HttpError(404, "Article not found");
  res.status(204).send();
});
