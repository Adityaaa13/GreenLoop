import { useState, useEffect } from "react";
import api from "../../services/api";

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    const fetchMyReports = async () => {
        try {
            const { data } = await api.get("/reports/my");
            setReports(data.reports);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoadingReports(false);
        }
    };

    useEffect(() => {
        fetchMyReports();
    }, []);

    const getStatusBadge = (status) => {
        const badges = {
            pending_validation: "bg-amber-100 text-amber-800 border-amber-200",
            verified_dump: "bg-emerald-100 text-emerald-800 border-emerald-200",
            rejected: "bg-rose-100 text-rose-800 border-rose-200",
        };
        const labels = {
            pending_validation: "In Review",
            verified_dump: "Verified",
            rejected: "Rejected",
        };
        return (
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${badges[status] || "bg-gray-100 text-gray-800"}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Reports History</h1>
                <p className="text-gray-500 mt-1">Review the status and AI feedback for all the dumps you've reported.</p>
            </div>

            {/* ── Reports Table ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">AI Confidence</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">AI Feedback</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loadingReports ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                                            <p className="text-sm font-medium text-gray-500">Loading your reports...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">No reports yet</h3>
                                            <p className="text-sm text-gray-500 max-w-sm mb-6">Looks like you haven't submitted any dump reports yet. Make your first report to help clean up the community!</p>
                                            <a href="/citizen/submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">Submit a Report</a>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report._id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 mr-4 shadow-sm border border-gray-100">
                                                    <img src={report.imageUrl} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{new Date(report.createdAt).toLocaleDateString()}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {report.aiValidation?.confidence != null ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${report.aiValidation.confidence > 0.8 ? 'bg-emerald-500' : report.aiValidation.confidence > 0.5 ? 'bg-amber-400' : 'bg-red-500'}`} 
                                                            style={{width: `${Math.round(report.aiValidation.confidence * 100)}%`}}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700">{Math.round(report.aiValidation.confidence * 100)}%</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm font-medium">Processing...</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {report.aiValidation?.reasoning ? (
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-teal-700 font-bold transition-colors bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    View AI Analysis
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 font-medium">Not Available</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── AI Reasoning Modal ── */}
            {selectedReport && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <span className="text-emerald-500">🤖</span> AI Analysis Report
                            </h3>
                            <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-1 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="rounded-xl overflow-hidden mb-6 shadow-sm border border-gray-100 relative group">
                                <img src={selectedReport.imageUrl} alt="Dump" className="w-full h-56 object-cover" />
                                <div className="absolute top-3 left-3">
                                    {getStatusBadge(selectedReport.status)}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location Coordinates</h4>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span className="text-sm font-medium text-gray-700">{selectedReport.location?.coordinates[1]?.toFixed(5) || "N/A"}, {selectedReport.location?.coordinates[0]?.toFixed(5) || "N/A"}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">AI Reasoning</h4>
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                            {selectedReport.aiValidation?.reasoning || "No reasoning provided."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReports;
