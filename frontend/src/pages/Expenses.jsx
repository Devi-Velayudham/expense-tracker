import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import EmojiPicker from "emoji-picker-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= UTILS ================= */

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN").format(n);

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [icon, setIcon] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  /* ===== TIME FILTER ===== */
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showTimeModal, setShowTimeModal] = useState(false);

  const availableYears = Array.from(
    { length: 11 },
    (_, i) => currentYear - i
  );

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await API.get("/expense");
    setExpenses(res.data);
  };

  /* ================= CRUD ================= */

  const handleAddExpense = async (e) => {
    e.preventDefault();

    await API.post("/expense/add", {
      title,
      amount,
      date,
      icon,
    });

    setTitle("");
    setAmount("");
    setDate("");
    setIcon("");
    setShowPicker(false);
    setShowModal(false);

    fetchExpenses();
  };

  const handleDeleteExpense = async (id) => {
    await API.delete(`/expense/${id}`);
    fetchExpenses();
  };

  /* ================= FILTER ================= */

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getFullYear() === selectedYear &&
        d.getMonth() === selectedMonth
      );
    });
  }, [expenses, selectedYear, selectedMonth]);

  const totalMonthlyExpense = filteredExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  /* ================= CHART ================= */

  const chartData = filteredExpenses.map((e) => ({
    date: new Date(e.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    amount: e.amount,
  }));

  /* ================= DOWNLOAD ================= */

  const downloadCSV = (data, filename) => {
    if (!data.length) return;

    const headers = ["Title", "Amount", "Date"];
    const rows = data.map((e) => [
      e.title,
      e.amount,
      new Date(e.date).toDateString(),
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-8 relative">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expenses</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowTimeModal(true)}
            className="border px-4 py-2 rounded-lg"
          >
            {MONTHS[selectedMonth]} {selectedYear}
          </button>

          <button
            onClick={() => downloadCSV(expenses, "all_expenses.csv")}
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium"
          >
            Download All
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* TOTAL CARD */}
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-500">
          Total Expenses · {MONTHS[selectedMonth]} {selectedYear}
        </p>
        <p className="text-3xl font-bold text-red-600">
          ₹{formatINR(totalMonthlyExpense)}
        </p>
      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Expense Overview</h2>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => `₹${formatINR(v)}`} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#7C5CFC"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* EXPENSE LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold">All Expenses</h2>
          <button
            onClick={() =>
              downloadCSV(
                filteredExpenses,
                `expenses_${MONTHS[selectedMonth]}_${selectedYear}.csv`
              )
            }
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium"
          >
            Download
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExpenses.map((e) => (
            <div
              key={e._id}
              className="flex justify-between items-center border p-4 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{e.icon}</span>
                <div>
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(e.date).toDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="font-bold text-red-600">
                  ₹{formatINR(e.amount)}
                </p>
                <button
                  onClick={() => handleDeleteExpense(e._id)}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= TIME MODAL ================= */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 relative">
            <button
              onClick={() => setShowTimeModal(false)}
              className="absolute top-3 right-3 text-xl"
            >
              ×
            </button>

            <h3 className="text-lg font-semibold mb-4">Select Time</h3>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(+e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(+e.target.value)}
              className="w-full border p-2 rounded mb-4"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>

            <button
              onClick={() => setShowTimeModal(false)}
              className="w-full bg-purple-600 text-white py-2 rounded-lg"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* ================= ADD MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-xl"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4">Add Expense</h2>

            <div className="relative mb-4">
              <div
                onClick={() => setShowPicker(!showPicker)}
                className="w-12 h-12 border rounded-lg flex items-center justify-center cursor-pointer"
              >
                {icon || "🖼️"}
              </div>

              {showPicker && (
                <div className="absolute top-14 left-0 z-50">
                  <EmojiPicker
                    onEmojiClick={(e) => {
                      setIcon(e.emoji);
                      setShowPicker(false);
                    }}
                  />
                </div>
              )}
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <input
                type="text"
                placeholder="Expense Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-3 rounded-lg"
                required
              />

              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border p-3 rounded-lg"
                required
              />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border p-3 rounded-lg"
                required
              />

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
