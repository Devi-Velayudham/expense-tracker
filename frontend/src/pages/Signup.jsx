import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AuthRightSide from "../components/AuthRightSide";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });

      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      
      {/* LEFT – SIGNUP FORM */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md">

          {/* TITLE */}
          <h1 className="text-4xl font-bold text-purple-600 mb-8">
            Expense Tracker
          </h1>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Create an Account
          </h2>

          <p className="text-gray-500 mb-8">
            Join us today by entering your details below
          </p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input
                type="text"
                placeholder="John"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
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
                autoComplete="new-password"
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
              SIGN UP
            </button>
          </form>

          <p className="text-sm text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-purple-600 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT – SAME DESIGN AS LOGIN */}
      <AuthRightSide />
    </div>
  );
}
