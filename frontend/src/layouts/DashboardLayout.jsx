import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// We'll generate dynamic nav items based on the user's role inside the component

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const getNavItems = () => {
        if (!user) return [];
        switch (user.role) {
            case "admin": return [{ label: "Admin Dashboard", path: "/admin", icon: "⚙️" }];
            case "worker": return [{ label: "Worker Tasks", path: "/worker", icon: "🔧" }];
            case "team_lead": return [{ label: "Team Management", path: "/team-lead", icon: "👥" }];
            case "citizen": return [
                { label: "Dashboard Hub", path: "/citizen", icon: "🏠" },
                { label: "Submit New Report", path: "/citizen", icon: "📷" },
                { label: "My Reports History", path: "/citizen", icon: "🗂️" },
                { label: "Community Stats", path: "/citizen", icon: "🌍" },
                { label: "Help & Guides", path: "/citizen", icon: "ℹ️" },
            ];
            default: return [];
        }
    };

    const currentNavItems = getNavItems();

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
                    fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-900
                    transform transition-transform duration-300 ease-in-out
                    flex flex-col
                    lg:translate-x-0 lg:static lg:z-auto shadow-2xl
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-white/10 shrink-0">
                    <Link to="/" className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <span className="text-emerald-400">🌿</span> GreenLoop
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-white/70 hover:text-white lg:hidden p-2 bg-white/5 rounded-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {currentNavItems.map((item, index) => {
                        const isActive = location.pathname === item.path && index === 0; // Highlight only the first for now as they point to the same page
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold
                                    transition-all duration-300 group
                                    ${isActive
                                        ? "bg-white/10 text-white shadow-sm border border-white/5"
                                        : "text-emerald-100/70 hover:bg-white/5 hover:text-white hover:translate-x-1"
                                    }
                                `}
                            >
                                <span className={`text-xl transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Card (Bottom of sidebar) */}
                {user && (
                    <div className="p-4 shrink-0 border-t border-white/10 bg-black/10">
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 flex items-center justify-center text-teal-900 font-bold text-lg shadow-inner">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                <p className="text-xs font-medium text-emerald-300/80 truncate capitalize flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
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
                    <h1 className="text-lg font-bold text-gray-800 hidden lg:block tracking-tight">
                        {currentNavItems.find((i) => i.path === location.pathname)?.label || "Dashboard"}
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
