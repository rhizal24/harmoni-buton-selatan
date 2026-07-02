-- Schema for Harmoni Buton Selatan
-- Two villages share these tables; rows are scoped by the `village` column.

CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  village       TEXT NOT NULL CHECK (village IN ('gayabaru', 'gerakmakmur')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS articles (
  id              SERIAL PRIMARY KEY,
  village         TEXT NOT NULL CHECK (village IN ('gayabaru', 'gerakmakmur')),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL,
  content         TEXT NOT NULL,
  excerpt         TEXT,
  cover_image_url TEXT,
  published       BOOLEAN NOT NULL DEFAULT false,
  author_id       INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (village, slug)
);

CREATE INDEX IF NOT EXISTS idx_articles_village_published
  ON articles (village, published, created_at DESC);
