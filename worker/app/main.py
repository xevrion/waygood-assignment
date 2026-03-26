import json
import os
import signal
import sys
import time
from datetime import datetime, timezone

from dotenv import load_dotenv
from bson import ObjectId
from pymongo import MongoClient
from redis import Redis

load_dotenv()

MONGO_URI = os.environ["MONGO_URI"]
REDIS_URL = os.environ["REDIS_URL"]
QUEUE_KEY = os.environ.get("REDIS_QUEUE_KEY", "ai-task-jobs")

mongo = MongoClient(MONGO_URI)
db = mongo.get_default_database()
tasks = db["tasks"]
redis = Redis.from_url(REDIS_URL, decode_responses=True)
running = True


def now():
    return datetime.now(timezone.utc)


def append_log(task_id, message):
    tasks.update_one({"_id": ObjectId(task_id)}, {"$push": {"logs": message}})


def perform_operation(operation, input_text):
    if operation == "uppercase":
        return input_text.upper()
    if operation == "lowercase":
        return input_text.lower()
    if operation == "reverse":
        return input_text[::-1]
    if operation == "word_count":
        return len([part for part in input_text.split() if part])
    raise ValueError(f"Unsupported operation: {operation}")


def process_job(payload):
    task_id = payload["taskId"]
    append_log(task_id, "Worker accepted job")
    tasks.update_one(
        {"_id": ObjectId(task_id)},
        {
            "$set": {
                "status": "running",
                "startedAt": now(),
                "errorMessage": None,
            }
        },
    )
    append_log(task_id, f"Running operation: {payload['operation']}")

    try:
        time.sleep(1)
        result = perform_operation(payload["operation"], payload["inputText"])
        tasks.update_one(
            {"_id": ObjectId(task_id)},
            {
                "$set": {
                    "status": "success",
                    "result": result,
                    "completedAt": now(),
                }
            },
        )
        append_log(task_id, "Task completed successfully")
    except Exception as error:
        tasks.update_one(
            {"_id": ObjectId(task_id)},
            {
                "$set": {
                    "status": "failed",
                    "errorMessage": str(error),
                    "completedAt": now(),
                }
            },
        )
        append_log(task_id, f"Task failed: {error}")


def shutdown(signum, frame):
    del frame
    global running
    running = False
    print(f"Received signal {signum}, shutting down worker", flush=True)


signal.signal(signal.SIGTERM, shutdown)
signal.signal(signal.SIGINT, shutdown)


def main():
    redis.ping()
    mongo.admin.command("ping")
    print("Worker ready", flush=True)

    while running:
        item = redis.blpop(QUEUE_KEY, timeout=5)
        if not item:
            continue

        _, raw_payload = item
        process_job(json.loads(raw_payload))

    return 0


if __name__ == "__main__":
    sys.exit(main())
