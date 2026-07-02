import { createApp } from "./app";
import { env } from "./config/env";
import { pool } from "./db";

const app = createApp();

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => {
    void pool.end().then(() => process.exit(0));
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
