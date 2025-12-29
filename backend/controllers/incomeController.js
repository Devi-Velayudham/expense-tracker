import Income from "../models/Income.js";
import ExcelJS from "exceljs";

// ADD INCOME
export const addIncome = async (req, res) => {
  try {
    const { title, amount, date, icon, description } = req.body;

    const income = await Income.create({
      user: req.user._id,
      title,
      amount,
      date,
      icon,
      description,
    });

    return res.status(201).json({
      message: "Income added successfully",
      income,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to add income",
      error: error.message,
    });
  }
};

// GET ALL INCOME
export const getAllIncome = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json(incomes);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch income",
      error: error.message,
    });
  }
};

// DELETE INCOME
export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    return res.status(200).json({
      message: "Income deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete income",
      error: error.message,
    });
  }
};

export const downloadIncome = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Income");

    worksheet.columns = [
      { header: "Title", key: "title", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Category", key: "category", width: 20 },
      { header: "Date", key: "date", width: 20 },
      { header: "Description", key: "description", width: 30 },
    ];

    incomes.forEach((income) => {
      worksheet.addRow({
        title: income.title,
        amount: income.amount,
        category: income.category,
        date: income.date.toISOString().split("T")[0],
        description: income.description || "",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=income.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      message: "Failed to download income",
      error: error.message,
    });
  }
};