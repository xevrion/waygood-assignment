import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { redis } from "./config/redis.js";
import { app } from "./app.js";

async function start() {
  await connectDatabase();
  await redis.ping();

  app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});

