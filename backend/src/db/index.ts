import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { env } from "../config/env";

// Neon requires SSL. The connection string already carries `sslmode=require`,
// but we set ssl here as well so it works regardless of the URL.
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params as unknown[]);
}
