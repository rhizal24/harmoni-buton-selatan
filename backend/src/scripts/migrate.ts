import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pool } from "../db";

async function main(): Promise<void> {
  const schemaPath = join(__dirname, "..", "db", "schema.sql");
  const sql = readFileSync(schemaPath, "utf8");
  await pool.query(sql);
  console.log("Migration applied successfully.");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
