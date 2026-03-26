import { redis } from "../config/redis.js";
import { REDIS_QUEUE_KEY } from "../utils/constants.js";

export async function enqueueTask(task) {
  const payload = JSON.stringify({
    taskId: task._id.toString(),
    userId: task.userId.toString(),
    operation: task.operation,
    inputText: task.inputText
  });

  await redis.rpush(REDIS_QUEUE_KEY, payload);
}

