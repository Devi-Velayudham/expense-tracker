import Expense from "../models/Expense.js";
import ExcelJS from "exceljs";


// ADD EXPENSE
export const addExpense = async (req, res) => {
  try {
    const { title, amount, date, icon, description } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      date,
      icon,
      description,
    });

    return res.status(201).json({
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add expense",
      error: error.message,
    });
  }
};

// GET ALL EXPENSES
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
};

// DELETE EXPENSE
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete expense",
      error: error.message,
    });
  }
};

export const downloadExpense = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expenses");

    worksheet.columns = [
      { header: "Title", key: "title", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Icon", key: "icon", width: 20 },
      { header: "Date", key: "date", width: 20 },
      { header: "Description", key: "description", width: 30 },
    ];

    expenses.forEach((expense) => {
      worksheet.addRow({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date.toISOString().split("T")[0],
        description: expense.description || "",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=expenses.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      message: "Failed to download expenses",
      error: error.message,
    });
  }
};
