import express from "express";
import { signup, login } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);

// Get logged-in user info
router.get("/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    user: req.user
  });
});

export default router;
