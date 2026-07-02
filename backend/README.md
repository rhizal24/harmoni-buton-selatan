# Harmoni Buton Selatan — Backend API

Express 5 + TypeScript API for the two village websites (**gayabaru** and **gerakmakmur**).
Data lives in a single **Neon** (Postgres) database; every row is scoped by a `village` column.

## Features

- Admin-only auth (JWT + bcrypt). Two admins — one per village.
- Each admin can only read/write articles for **their own village** (enforced from the token, not the request body).
- Article publishing (CRUD) with per-village unique slugs.
- Public, read-only endpoints per village (published articles only).

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill it in:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — from the Neon dashboard → Connection Details (include `?sslmode=require`).
   - `JWT_SECRET` — a long random string.
   - `ADMIN_*_PASSWORD` — passwords for the two seed admins.

3. Create the tables:

   ```bash
   npm run migrate
   ```

4. Create the two admin accounts:

   ```bash
   npm run seed
   ```

5. Run the dev server (http://localhost:3001):

   ```bash
   npm run dev
   ```

## Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Dev server with auto-reload          |
| `npm run build`   | Compile TypeScript to `dist/`        |
| `npm start`       | Run the compiled server              |
| `npm run migrate` | Apply `src/db/schema.sql` to Neon    |
| `npm run seed`    | Create/update the two village admins |
| `npm run typecheck` | Type-check without emitting        |

## API

Base path: `/api`

### Auth

| Method | Path          | Auth   | Body                       | Description                     |
| ------ | ------------- | ------ | -------------------------- | ------------------------------- |
| POST   | `/auth/login` | —      | `{ username, password }`   | Returns `{ token, admin }`      |
| GET    | `/auth/me`    | Bearer | —                          | Returns the current admin       |

### Public (per village, published only)

`:village` must be `gayabaru` or `gerakmakmur`.

| Method | Path                                   | Description                     |
| ------ | -------------------------------------- | ------------------------------- |
| GET    | `/villages/:village/articles`          | List published articles         |
| GET    | `/villages/:village/articles/:slug`    | Get one published article       |

### Admin (Bearer token; scoped to the admin's own village)

| Method | Path                   | Body                                                            | Description              |
| ------ | ---------------------- | -------------------------------------------------------------- | ------------------------ |
| GET    | `/admin/articles`      | —                                                              | List all own articles    |
| GET    | `/admin/articles/:id`  | —                                                              | Get one own article      |
| POST   | `/admin/articles`      | `{ title, content, excerpt?, coverImageUrl?, slug?, published? }` | Create an article        |
| PUT    | `/admin/articles/:id`  | any subset of the create fields                                | Update an article        |
| DELETE | `/admin/articles/:id`  | —                                                              | Delete an article        |

The `village` is always taken from the auth token, so an admin cannot create or edit
articles for the other village.

### Example

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_gayabaru","password":"..."}'

# Create an article (use the token from the login response)
curl -X POST http://localhost:3001/api/admin/articles \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Kegiatan Desa","content":"...","published":true}'

# Public read
curl http://localhost:3001/api/villages/gayabaru/articles
```

## Notes

- To add or rename a village, update `src/constants/villages.ts`, the `CHECK` constraints in
  `src/db/schema.sql`, and the seed list in `src/scripts/seed.ts`.
- Cover images are stored as URLs (`cover_image_url`). Actual file/image uploads to object
  storage are not implemented yet.
