import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();

/* =======================
   CORS CONFIG (IMPORTANT)
   ======================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://expense-tracker-ruby-mu.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);



/* =======================
   MIDDLEWARES
   ======================= */
app.use(express.json());

/* =======================
   ROUTES
   ======================= */
app.use("/api/auth", authRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* =======================
   TEST ROUTE
   ======================= */
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

/* =======================
   DATABASE
   ======================= */
connectDB();

/* =======================
   START SERVER
   ======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
