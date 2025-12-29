import express from "express";
import {
  addIncome,
  getAllIncome,
  deleteIncome,
  downloadIncome,
} from "../controllers/incomeController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add income
router.post("/add", authMiddleware, addIncome);

// Get all income
router.get("/", authMiddleware, getAllIncome);

// Delete income
router.delete("/:id", authMiddleware, deleteIncome);

// Download income (Excel)
router.get("/download", authMiddleware, downloadIncome);


export default router;
