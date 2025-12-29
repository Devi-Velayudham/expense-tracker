import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

export const getDashboardData = async (req, res) => {
  try {
    /* ===== FETCH ALL ===== */
    const incomes = await Income.find({ user: req.user._id });
    const expenses = await Expense.find({ user: req.user._id });

    /* ===== TOTALS ===== */
    const totalIncome = incomes.reduce(
      (sum, i) => sum + Number(i.amount),
      0
    );

    const totalExpense = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );

    const balance = totalIncome - totalExpense;

    /* ===== RECENT TRANSACTIONS (WITH ICON) ===== */
    const recentIncome = await Income.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("title amount date icon createdAt");

    const recentExpense = await Expense.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("title amount date category icon createdAt");

    const recentTransactions = [
      ...recentIncome.map((i) => ({
        _id: i._id,
        title: i.title,
        amount: i.amount,
        date: i.date,
        icon: i.icon,
        type: "income",
        createdAt: i.createdAt,
      })),
      ...recentExpense.map((e) => ({
        _id: e._id,
        title: e.title,
        amount: e.amount,
        date: e.date,
        icon: e.icon,
        type: "expense",
        createdAt: e.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    return res.status(200).json({
      totalIncome,
      totalExpense,
      balance,
      recentTransactions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Dashboard data fetch failed",
      error: error.message,
    });
  }
};
