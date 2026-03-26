import { Task } from "../models/Task.js";
import { enqueueTask } from "../services/taskQueueService.js";
import { TASK_OPERATIONS } from "../utils/constants.js";

export async function createTask(req, res) {
  const { title, inputText, operation } = req.body;

  if (!title || !inputText || !TASK_OPERATIONS.includes(operation)) {
    return res.status(400).json({
      message: "Title, inputText, and a valid operation are required"
    });
  }

  const task = await Task.create({
    userId: req.user._id,
    title,
    inputText,
    operation,
    logs: ["Task created", "Queued for processing"]
  });

  try {
    await enqueueTask(task);
  } catch (error) {
    task.status = "failed";
    task.errorMessage = "Failed to enqueue task";
    task.logs.push(`Queue error: ${error.message}`);
    await task.save();
    throw error;
  }

  return res.status(201).json({ task });
}

export async function listTasks(req, res) {
  const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  return res.json({ tasks });
}

export async function getTask(req, res) {
  const task = await Task.findOne({
    _id: req.params.taskId,
    userId: req.user._id
  }).lean();

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  return res.json({ task });
}
