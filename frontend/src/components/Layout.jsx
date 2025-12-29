import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="ml-64 p-8 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
