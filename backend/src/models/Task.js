import mongoose from "mongoose";
import { TASK_OPERATIONS, TASK_STATUSES } from "../utils/constants.js";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    inputText: {
      type: String,
      required: true
    },
    operation: {
      type: String,
      enum: TASK_OPERATIONS,
      required: true
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "pending",
      index: true
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    },
    logs: {
      type: [String],
      default: []
    },
    startedAt: Date,
    completedAt: Date
  },
  {
    timestamps: true
  }
);

taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ status: 1, createdAt: -1 });

export const Task = mongoose.model("Task", taskSchema);

