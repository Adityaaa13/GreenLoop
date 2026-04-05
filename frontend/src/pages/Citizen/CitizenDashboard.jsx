import { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const CitizenDashboard = () => {
    const { user } = useAuth();
    // Dashboard Stats
    const [stats, setStats] = useState({ totalSubmitted: 0, verified: 0, rejected: 0, pending: 0, cleanupAssigned: 0, cleaned: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    const fetchDashboardStats = async () => {
        try {
            const { data } = await api.get("/dashboard/citizen");
            setStats({
                totalSubmitted: data.totalSubmitted,
                verified: data.verified,
                rejected: data.rejected,
                pending: data.pending,
                cleanupAssigned: data.cleanupAssigned || 0,
                cleaned: data.cleaned || 0,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* ── Welcome Banner ── */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-teal-900 opacity-20 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {getGreeting()}, {user?.name || "Citizen"}! 👋
                        </h1>
                        <p className="mt-2 text-emerald-50 text-sm md:text-base max-w-2xl">
                            Welcome to your GreenLoop hub. Help us keep the community clean by reporting illegal dumping, tracking your impact, and earning rewards.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: "Total Reports", value: stats.totalSubmitted, color: "blue", filter: "",
                      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
                    { label: "Verified", value: stats.verified, color: "emerald", filter: "verified_dump",
                      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                    { label: "Assigned", value: stats.cleanupAssigned, color: "purple", filter: "cleanup_assigned",
                      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
                    { label: "Cleaned", value: stats.cleaned, color: "teal", filter: "cleaned",
                      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> },
                    { label: "Rejected", value: stats.rejected, color: "rose", filter: "rejected",
                      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                ].map(({ label, value, color, icon, filter }) => (
                    <Link
                        key={label}
                        to={filter ? `/citizen/reports?filter=${filter}` : "/citizen/reports"}
                        className={`group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100 flex flex-col gap-3 cursor-pointer`}
                    >
                        <div className={`p-2.5 bg-${color}-50 text-${color}-600 rounded-xl w-fit group-hover:scale-110 transition-transform`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{loadingStats ? "-" : value}</p>
                            <p className={`text-[11px] font-semibold text-${color}-600 uppercase tracking-wider mt-0.5`}>{label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ── Quick Actions Grid ── */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="text-emerald-500">⚡</span> Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Action 1 */}
                    <Link to="/citizen/submit" className="group bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden block">
                        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-emerald-50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-emerald-700 transition-colors">Report Dump</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Found an illegal dump? Take a photo and let our AI handle the rest.</p>
                        <div className="mt-4 flex items-center text-emerald-600 font-semibold text-sm">
                            Submit a report &rarr;
                        </div>
                    </Link>

                    {/* Action 2 */}
                    <Link to="/citizen/reports" className="group bg-white rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden block">
                        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-blue-50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">My History</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Track the status of your reported dumps and view the AI analysis.</p>
                        <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm">
                            View reports &rarr;
                        </div>
                    </Link>

                    {/* Action 3 */}
                    <Link to="/citizen/stats" className="group bg-white rounded-2xl p-6 shadow-sm border border-amber-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden block">
                        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-amber-50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-amber-700 transition-colors">Community Impact</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">See how you and your neighbors are making a difference city-wide.</p>
                        <div className="mt-4 flex items-center text-amber-600 font-semibold text-sm">
                            Explore stats &rarr;
                        </div>
                    </Link>

                    {/* Action 4 */}
                    <Link to="/citizen/help" className="group bg-white rounded-2xl p-6 shadow-sm border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden block">
                        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-purple-50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-fuchsia-500 rounded-xl text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-purple-700 transition-colors">Help & Guides</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Not sure how to report or what counts as illegal dumping? Read this.</p>
                        <div className="mt-4 flex items-center text-purple-600 font-semibold text-sm">
                            Get help &rarr;
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;
