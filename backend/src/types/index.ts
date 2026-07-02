import type { Village } from "../constants/villages";

export interface AdminRow {
  id: number;
  username: string;
  password_hash: string;
  village: Village;
  created_at: Date;
}

export interface ArticleRow {
  id: number;
  village: Village;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published: boolean;
  author_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuthAdmin {
  id: number;
  username: string;
  village: Village;
}
