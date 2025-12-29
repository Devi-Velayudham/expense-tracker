import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import EmojiPicker from "emoji-picker-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/* ================= UTILS ================= */

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN").format(n);

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Income() {
  const [incomes, setIncomes] = useState([]);

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

  // ✅ FIXED YEAR LOGIC (current year + previous 10 years)
  const availableYears = Array.from(
    { length: 11 },
    (_, i) => currentYear - i
  );

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    const res = await API.get("/income");
    setIncomes(res.data);
  };

  /* ================= CRUD ================= */

  const handleAddIncome = async (e) => {
    e.preventDefault();

    await API.post("/income/add", {
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

    fetchIncome();
  };

  const handleDeleteIncome = async (id) => {
    await API.delete(`/income/${id}`);
    fetchIncome();
  };

  /* ================= FILTER ================= */

  const filteredIncome = useMemo(() => {
    return incomes.filter((i) => {
      const d = new Date(i.date);
      return (
        d.getFullYear() === selectedYear &&
        d.getMonth() === selectedMonth
      );
    });
  }, [incomes, selectedYear, selectedMonth]);

  const totalMonthlyIncome = filteredIncome.reduce(
    (sum, i) => sum + i.amount,
    0
  );

  /* ================= CHART ================= */

  const chartData = filteredIncome.map((i) => ({
    date: new Date(i.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    amount: i.amount,
  }));

  /* ================= DOWNLOAD ================= */

  const downloadCSV = (data, filename) => {
    if (!data.length) return;

    const headers = ["Title", "Amount", "Date"];
    const rows = data.map((i) => [
      i.title,
      i.amount,
      new Date(i.date).toDateString(),
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

  return (
    <div className="p-6 space-y-8 relative">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Income</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowTimeModal(true)}
            className="border px-4 py-2 rounded-lg"
          >
            {MONTHS[selectedMonth]} {selectedYear}
          </button>

          <button
            onClick={() => downloadCSV(incomes, "all_income.csv")}
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium"
          >
            Download All
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Add Income
          </button>
        </div>
      </div>

      {/* TOTAL CARD */}
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-500">
          Total Income · {MONTHS[selectedMonth]} {selectedYear}
        </p>
        <p className="text-3xl font-bold text-green-600">
          ₹{formatINR(totalMonthlyIncome)}
        </p>
      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Income Overview</h2>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => `₹${formatINR(v)}`} />
              <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i % 2 === 0 ? "#7C5CFC" : "#C7B8FF"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* INCOME LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold">Income Sources</h2>
          <button
            onClick={() =>
              downloadCSV(
                filteredIncome,
                `income_${MONTHS[selectedMonth]}_${selectedYear}.csv`
              )
            }
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium"
          >
            Download
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIncome.map((i) => (
            <div
              key={i._id}
              className="flex justify-between items-center border p-4 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{i.icon}</span>
                <div>
                  <p className="font-semibold">{i.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(i.date).toDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="font-bold text-green-600">
                  ₹{formatINR(i.amount)}
                </p>
                <button
                  onClick={() => handleDeleteIncome(i._id)}
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
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold"
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

            <h2 className="text-xl font-semibold mb-4">Add Income</h2>

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

            <form onSubmit={handleAddIncome} className="space-y-4">
              <input
                type="text"
                placeholder="Income Source"
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
                Add Income
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
