import { useState, useEffect } from "react";
import api from "../../services/api";

const CommunityStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get("/dashboard/community-stats");
                setStats(data);
            } catch (err) {
                console.error("Error fetching community stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    const {
        totalVerifiedDumps = 0,
        activeCitizens = 0,
        totalCleanups = 0,
        totalReports = 0,
        topContributors = []
    } = stats || {};

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Community Stats</h1>
                <p className="text-gray-500 mt-1">See the broader impact of reporting in your area.</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase">Verified Dumps</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{totalVerifiedDumps}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase">Active Citizens</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{activeCitizens}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100 bg-gradient-to-br from-teal-50 to-white">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase">Cleanups Done</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{totalCleanups}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase">Total Reports</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{totalReports}</p>
                </div>
            </div>

            {/* Top Contributors Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Top Community Contributors</h2>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">Live Data</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Citizen</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reports Verified</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Accuracy</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {topContributors.length > 0 ? topContributors.map((row, idx) => (
                                <tr key={row._id || idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                                            idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            idx === 1 ? 'bg-gray-200 text-gray-700' :
                                            idx === 2 ? 'bg-amber-100 text-amber-800' :
                                            'bg-emerald-50 text-emerald-700'
                                        }`}>
                                            #{idx + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{row.name || "Anonymous"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">{row.verified} verified</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{width: `${row.accuracy}%`}}></div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">{row.accuracy}%</span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-sm">
                                        No contributors yet. Be the first to report a dump!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommunityStats;
