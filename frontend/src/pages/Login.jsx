import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import AuthRightSide from "../components/AuthRightSide";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      // Save token
      localStorage.setItem("token", res.data.token);

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT – LOGIN FORM */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* TITLE */}
          <h1 className="text-4xl font-bold text-purple-600 mb-8">
            Expense Tracker
          </h1>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome Back
          </h2>

          <p className="text-gray-500 mb-8">
            Please enter your details to log in
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm mb-1">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="on"
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
            >
              LOGIN
            </button>
          </form>

          <p className="text-sm text-center mt-6">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-purple-600 font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT – DESIGN */}
      <AuthRightSide />
    </div>
  );
}
