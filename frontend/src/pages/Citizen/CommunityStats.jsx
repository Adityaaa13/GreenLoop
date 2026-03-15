const CommunityStats = () => {
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
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase">Total Verified Dumps</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">2,419</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase">Active Citizens</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">843</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 bg-gradient-to-br from-amber-50 to-white">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase">Avg Resolution Time</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">4.2 <span className="text-lg text-gray-500 font-medium">Days</span></p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase">Waste Removed Approx</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">12k <span className="text-lg text-gray-500 font-medium">Lbs</span></p>
                </div>
            </div>

            {/* Top Contributors Table (Mocked for Visual Purposes) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Top Community Contributors (Monthly)</h2>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">Updated Today</span>
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
                            {[
                                { rank: 1, name: "Sarah J.", verified: 42, acc: 98 },
                                { rank: 2, name: "Michael R.", verified: 36, acc: 95 },
                                { rank: 3, name: "Elena G.", verified: 31, acc: 100 },
                                { rank: 4, name: "David T.", verified: 24, acc: 92 },
                                { rank: 5, name: "Jessica W.", verified: 19, acc: 89 },
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                                            row.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                            row.rank === 2 ? 'bg-gray-200 text-gray-700' :
                                            row.rank === 3 ? 'bg-amber-100 text-amber-800' :
                                            'bg-emerald-50 text-emerald-700'
                                        }`}>
                                            #{row.rank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{row.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">{row.verified} dumps cleaned</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{width: `${row.acc}%`}}></div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">{row.acc}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommunityStats;
