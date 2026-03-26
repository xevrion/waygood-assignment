import { Router } from "express";
import { createTask, getTask, listTasks } from "../controllers/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export const taskRouter = Router();

taskRouter.use(authMiddleware);
taskRouter.post("/", createTask);
taskRouter.get("/", listTasks);
taskRouter.get("/:taskId", getTask);

