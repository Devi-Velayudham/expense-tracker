import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  /* YEAR STATE */
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    const fetchAll = async () => {
      const d = await API.get("/dashboard");
      const e = await API.get("/expense");
      const i = await API.get("/income");

      setDashboard(d.data);
      setExpenses(e.data);
      setIncome(i.data);
      setLoading(false);
    };

    fetchAll();
  }, []);

  const formatCurrency = (n) =>
    new Intl.NumberFormat("en-IN").format(n);

  if (loading || !dashboard) {
    return <div className="p-8">Loading...</div>;
  }

  /* ================= YEARLY TOTALS ================= */

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const yearlyIncome = income
    .filter(i => new Date(i.date).getFullYear() === selectedYear)
    .reduce((sum, i) => sum + i.amount, 0);

  const yearlyExpense = expenses
    .filter(e => new Date(e.date).getFullYear() === selectedYear)
    .reduce((sum, e) => sum + e.amount, 0);

  const yearlyBalance = yearlyIncome - yearlyExpense;

  /* ================= RECENT TRANSACTIONS (CURRENT YEAR ONLY) ================= */

  const recentTransactions = [
  ...income.map(i => ({
    ...i,
    type: "income",
  })),
  ...expenses.map(e => ({
    ...e,
    type: "expense",
  })),
]
  .filter(t => new Date(t.date).getFullYear() === currentYear)
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 6);


  /* ================= EXPENSES ================= */

  const lastExpenses = [...expenses]
    .filter(e => new Date(e.date).getFullYear() === currentYear)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const expenseBarData = lastExpenses.map((e) => ({
    date: new Date(e.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    amount: e.amount,
  }));

  /* ================= INCOME (CURRENT YEAR ONLY) ================= */

  const currentYearIncome = income
    .filter(i => new Date(i.date).getFullYear() === currentYear)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  /* ================= LAST 60 DAYS INCOME (UNCHANGED) ================= */

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const last60DaysIncome = income.filter(
    (i) => new Date(i.date) >= sixtyDaysAgo
  );

  const incomeDonutData = last60DaysIncome.map((i) => ({
    name: i.title,
    value: i.amount,
  }));

  const totalLast60Income = last60DaysIncome.reduce(
    (sum, i) => sum + i.amount,
    0
  );

  /* ================= UI ================= */

  return (
    <div className="p-10 space-y-10">

      {/* YEAR SELECT */}
      <div className="flex justify-end -mt-8 mb-2">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(+e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <SummaryCard title={`Total Income (${selectedYear})`} value={yearlyIncome} color="green" icon={<TrendingUp />} />
        <SummaryCard title={`Total Expenses (${selectedYear})`} value={yearlyExpense} color="red" icon={<TrendingDown />} />
        <SummaryCard title={`Balance (${selectedYear})`} value={yearlyBalance} color="blue" icon={<Wallet />} />
      </div>

      {/* RECENT + OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* RECENT TRANSACTIONS */}
        <div className="bg-white rounded-2xl shadow p-10">
          <div className="flex justify-between mb-8">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <button onClick={() => navigate("/transactions")} className="text-purple-600 font-medium hover:underline">
              See All →
            </button>
          </div>

          <ul className="space-y-7">
            {recentTransactions.map((t) => (
              <li key={t._id} className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <span className="text-3xl">{t.icon}</span>
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(t.date).toDateString()}
                    </p>
                  </div>
                </div>
                <span className={t.type === "income" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {t.type === "income" ? "+" : "-"} ₹{formatCurrency(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* FINANCIAL OVERVIEW */}
        <div className="bg-white rounded-2xl shadow p-10">
          <h2 className="text-xl font-semibold mb-8">Financial Overview</h2>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Balance", value: yearlyBalance },
                    { name: "Expenses", value: yearlyExpense },
                    { name: "Income", value: yearlyIncome },

                  ]}
                  dataKey="value"
                  innerRadius={130}
                  outerRadius={185}
                >
                  <Cell fill="#7C5CFC" />
                  <Cell fill="#EF4444" />
                  <Cell fill="#F97316" />
                </Pie>
                <Tooltip formatter={(v) => `₹${formatCurrency(v)}`} />
                <Legend />
                <text x="50%" y="48%" textAnchor="middle" className="text-gray-500">Total Balance</text>
                <text x="50%" y="55%" textAnchor="middle" className="text-3xl font-bold">
                  ₹{formatCurrency(yearlyBalance)}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* EXPENSES + BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white rounded-2xl shadow p-10">
          <div className="flex justify-between mb-8">
            <h2 className="text-xl font-semibold">Expenses</h2>
            <button onClick={() => navigate("/expenses")} className="text-purple-600 font-medium hover:underline">
              See All →
            </button>
          </div>
          <ul className="space-y-7">
            {lastExpenses.map((e) => (
              <li key={e._id} className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <span className="text-3xl">{e.icon}</span>
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-sm text-gray-500">{new Date(e.date).toDateString()}</p>
                  </div>
                </div>
                <span className="text-red-600 font-semibold">- ₹{formatCurrency(e.amount)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow p-10">
          <h2 className="text-xl font-semibold mb-8">Last Expenses</h2>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v) => `₹${formatCurrency(v)}`} />
                <Bar dataKey="amount" fill="#7C5CFC" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* INCOME */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        <div className="bg-white rounded-2xl shadow p-10">
          <h2 className="text-xl font-semibold mb-8">Last 60 Days Income</h2>
          <div className="h-[440px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={incomeDonutData} dataKey="value" innerRadius={130} outerRadius={185}>
                  {incomeDonutData.map((_, i) => (
                    <Cell key={i} fill={["#22C55E","#3B82F6","#A855F7","#F59E0B"][i % 4]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${formatCurrency(v)}`} />
                <Legend />
                <text x="50%" y="44%" textAnchor="middle" className="text-gray-500">Total Income</text>
                <text x="50%" y="52%" textAnchor="middle" className="text-3xl font-bold">
                  ₹{formatCurrency(totalLast60Income)}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-10">
          <div className="flex justify-between mb-8">
            <h2 className="text-xl font-semibold">Income</h2>
            <button onClick={() => navigate("/income")} className="text-purple-600 font-medium hover:underline">
              See All →
            </button>
          </div>
          <ul className="space-y-7">
            {currentYearIncome.slice(0, 6).map((i) => (
              <li key={i._id} className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <span className="text-3xl">{i.icon}</span>
                  <div>
                    <p className="font-medium">{i.title}</p>
                    <p className="text-sm text-gray-500">{new Date(i.date).toDateString()}</p>
                  </div>
                </div>
                <span className="text-green-600 font-semibold">+ ₹{formatCurrency(i.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* SUMMARY CARD */
function SummaryCard({ title, value, color, icon }) {
  const colors = {
    green: "text-green-600 bg-green-100",
    red: "text-red-600 bg-red-100",
    blue: "text-blue-600 bg-blue-100",
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow flex items-center gap-6">
      <div className={`p-4 rounded-full ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-gray-500">{title}</p>
        <p className={`text-3xl font-bold ${colors[color].split(" ")[0]}`}>
          ₹{new Intl.NumberFormat("en-IN").format(value)}
        </p>
      </div>
    </div>
  );
}
