import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

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

export default function Transactions() {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  /* ===== TIME FILTER ===== */
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showTimeModal, setShowTimeModal] = useState(false);

  // current year + previous 10 years (NO future years)
  const availableYears = Array.from(
    { length: 11 },
    (_, i) => currentYear - i
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const i = await API.get("/income");
    const e = await API.get("/expense");

    setIncome(i.data);
    setExpenses(e.data);
  };

  /* ================= MERGE ================= */

  const allTransactions = useMemo(() => {
    return [
      ...income.map((i) => ({ ...i, type: "income" })),
      ...expenses.map((e) => ({ ...e, type: "expense" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [income, expenses]);

  /* ================= FILTER ================= */

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getFullYear() === selectedYear &&
        d.getMonth() === selectedMonth
      );
    });
  }, [allTransactions, selectedYear, selectedMonth]);

  /* ================= MONTHLY TOTALS ================= */

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  /* ================= LINE GRAPH ================= */

  const grouped = {};

  filteredTransactions.forEach((t) => {
    const key = new Date(t.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    if (!grouped[key]) {
      grouped[key] = { date: key, income: 0, expense: 0 };
    }

    if (t.type === "income") grouped[key].income += t.amount;
    else grouped[key].expense += t.amount;
  });

  const lineData = Object.values(grouped);

  /* ================= DOWNLOAD ================= */

  const downloadCSV = (data, filename) => {
    if (!data.length) return;

    const headers = ["Type", "Title", "Amount", "Date"];
    const rows = data.map((t) => [
      t.type,
      t.title,
      t.amount,
      new Date(t.date).toDateString(),
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
        <h1 className="text-3xl font-bold">Transactions</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowTimeModal(true)}
            className="border px-4 py-2 rounded-lg"
          >
            {MONTHS[selectedMonth]} {selectedYear}
          </button>

          <button
            onClick={() =>
              downloadCSV(allTransactions, "all_transactions.csv")
            }
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium"
          >
            Download All
          </button>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">
            Income · {MONTHS[selectedMonth]} {selectedYear}
          </p>
          <p className="text-3xl font-bold text-green-600">
            ₹{formatINR(totalIncome)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">
            Expenses · {MONTHS[selectedMonth]} {selectedYear}
          </p>
          <p className="text-3xl font-bold text-red-600">
            ₹{formatINR(totalExpense)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">
            Balance · {MONTHS[selectedMonth]} {selectedYear}
          </p>
          <p
            className={`text-3xl font-bold ${
              balance >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            ₹{formatINR(balance)}
          </p>
        </div>
      </div>

      {/* LINE GRAPH */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Income vs Expenses
        </h2>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => `₹${formatINR(v)}`} />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22C55E"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#EF4444"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Transaction History
          </h2>

          <button
            onClick={() =>
              downloadCSV(
                filteredTransactions,
                `transactions_${MONTHS[selectedMonth]}_${selectedYear}.csv`
              )
            }
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium"
          >
            Download
          </button>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500">No transactions found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTransactions.map((t) => (
              <div
                key={t._id}
                className="flex justify-between items-center p-4 rounded-xl border"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{t.icon}</span>
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(t.date).toDateString()}
                    </p>
                  </div>
                </div>

                <span
                  className={`font-semibold ${
                    t.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"} ₹
                  {formatINR(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= TIME MODAL ================= */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 relative">
            <button
              onClick={() => setShowTimeModal(false)}
              className="absolute top-3 right-3 text-xl font-bold"
            >
              ×
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Select Time
            </h3>

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
    </div>
  );
}
