import express from "express";
import {
  addExpense,
  getAllExpenses,
  deleteExpense,
  downloadExpense,
} from "../controllers/expenseController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add expense
router.post("/add", authMiddleware, addExpense);

// Get all expenses
router.get("/", authMiddleware, getAllExpenses);

// Delete expense
router.delete("/:id", authMiddleware, deleteExpense);

// Download expenses (Excel)
router.get("/download", authMiddleware, downloadExpense);

export default router;
