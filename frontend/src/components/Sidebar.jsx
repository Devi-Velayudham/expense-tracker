import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";

import { FaSignOutAlt, FaWallet } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { List } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data.user);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUser();
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <MdDashboard size={22} />,
    },
    {
      name: "Income",
      path: "/income",
      icon: <RiMoneyDollarCircleFill size={22} />,
    },
    {
      name: "Expense",
      path: "/expenses",
      icon: <FaWallet size={22} />,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <List size={22} />,
    },
  ];

  const activeClass =
    "flex items-center gap-3 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold shadow";
  const normalClass =
    "flex items-center gap-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-gray-100 transition";

  return (
    <div className="w-64 h-screen bg-white shadow-lg p-6 fixed top-0 left-0 flex flex-col">
      {/* Title */}
      <h1 className="text-2xl font-bold text-purple-600 mb-6">
        Expense Tracker
      </h1>

      {/* Profile */}
      <div className="flex flex-col items-center mb-10">
        <CgProfile size={70} className="text-purple-600" />
        <h2 className="text-xl font-bold mt-3">
          {user ? user.name : "Loading..."}
        </h2>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-3 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={
              location.pathname === item.path ? activeClass : normalClass
            }
          >
            {item.icon}
            {item.name}
          </Link>
        ))}

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="flex items-center gap-3 px-4 py-3 mt-5 text-red-600 rounded-xl hover:bg-red-100 transition"
        >
          <FaSignOutAlt size={20} />
          Logout
        </button>
      </nav>
    </div>
  );
}
