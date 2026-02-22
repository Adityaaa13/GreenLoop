import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { token, user, logout } = useAuth();

    return (
        <nav className="bg-gradient-to-r from-emerald-600 to-teal-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link
                        to="/"
                        className="text-2xl font-bold text-white tracking-tight hover:opacity-90 transition"
                    >
                        🌿 GreenLoop
                    </Link>

                    <div className="flex items-center gap-4">
                        {token ? (
                            <>
                                <span className="text-emerald-100 text-sm hidden sm:inline">
                                    Hi, {user?.name}
                                </span>
                                <Link
                                    to="/dashboard"
                                    className="text-white hover:text-emerald-200 text-sm font-medium transition"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-white hover:text-emerald-200 text-sm font-medium transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-white text-emerald-700 hover:bg-emerald-50 text-sm font-semibold px-4 py-2 rounded-lg transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
