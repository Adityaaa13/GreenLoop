import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "Citizen", path: "/citizen", icon: "👤" },
    { label: "Team Lead", path: "/team-lead", icon: "👥" },
    { label: "Worker", path: "/worker", icon: "🔧" },
    { label: "Admin", path: "/admin", icon: "⚙️" },
];

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* ── Mobile overlay ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-emerald-700 to-teal-800
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:static lg:z-auto
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
                    <Link to="/" className="text-xl font-bold text-white tracking-tight">
                        🌿 GreenLoop
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-white/70 hover:text-white lg:hidden"
                    >
                        ✕
                    </button>
                </div>

                {/* Nav links */}
                <nav className="mt-6 px-3 space-y-1">
                    {navItems
                        .filter((item) => {
                            // Only show the nav item if the user's role matches the path
                            if (!user) return false;
                            if (user.role === "admin" && item.path === "/admin") return true;
                            if (user.role === "worker" && item.path === "/worker") return true;
                            if (user.role === "team_lead" && item.path === "/team-lead") return true;
                            if (user.role === "citizen" && item.path === "/citizen") return true;
                            return false;
                        })
                        .map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                                        transition-colors duration-200
                                        ${isActive
                                            ? "bg-white/20 text-white"
                                            : "text-emerald-100 hover:bg-white/10 hover:text-white"
                                        }
                                    `}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                </nav>
            </aside>

            {/* ── Main content area ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top navbar */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Hamburger (mobile only) */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-600 hover:text-gray-900 lg:hidden"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Page title (hidden on mobile, shown on larger) */}
                    <h1 className="text-lg font-semibold text-gray-800 hidden lg:block">
                        {navItems.find((i) => i.path === location.pathname)?.label || "Dashboard"}
                    </h1>

                    {/* User info + Logout */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden sm:inline">
                            Hi, {user?.name}
                        </span>
                        <button
                            onClick={logout}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
