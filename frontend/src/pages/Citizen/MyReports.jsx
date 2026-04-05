import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { ChevronDown, ChevronUp, CheckSquare, X } from "lucide-react";

const getStatusBadge = (status) => {
    const badges = {
        pending_validation: "bg-amber-100 text-amber-800 border-amber-200",
        verified_dump: "bg-emerald-100 text-emerald-800 border-emerald-200",
        cleanup_assigned: "bg-blue-100 text-blue-800 border-blue-200",
        cleaned: "bg-emerald-100 text-emerald-800 border-emerald-200",
        rejected: "bg-rose-100 text-rose-800 border-rose-200",
    };
    const labels = {
        pending_validation: "In Review",
        verified_dump: "Verified",
        cleanup_assigned: "Assigned",
        cleaned: "Cleaned",
        rejected: "Rejected",
    };
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${badges[status] || "bg-gray-100 text-gray-800"}`}>
            {labels[status] || status}
        </span>
    );
};

const ReportRow = ({ report, onSelectReport }) => (
    <tr className="hover:bg-gray-50/80 transition-colors group">
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 mr-4 shadow-sm border border-gray-100">
                    <img src={report.imageUrl} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">{new Date(report.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 font-medium tracking-wide">
                        {new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="font-mono font-bold text-emerald-600">#{report._id.slice(-5).toUpperCase()}</span>
                    </p>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            {getStatusBadge(report.status)}
            {report.aiValidation?.confidence != null && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>AI Confidence:</span>
                    <span className={report.aiValidation.confidence > 0.8 ? 'text-emerald-500' : report.aiValidation.confidence > 0.5 ? 'text-amber-500' : 'text-red-500'}>
                        {Math.round(report.aiValidation.confidence * 100)}%
                    </span>
                </div>
            )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap min-w-[250px]">
            {/* Report Progress Bar */}
            {report.status === "rejected" ? (
                <div className="text-sm font-semibold text-rose-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Report Closed
                </div>
            ) : (
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between text-[10px] font-bold tracking-wider uppercase">
                        <span className="text-emerald-600">Submitted</span>
                        <span className={["verified_dump", "cleanup_assigned", "cleaned"].includes(report.status) ? "text-emerald-600" : "text-gray-300"}>Verified</span>
                        <span className={["cleanup_assigned", "cleaned"].includes(report.status) ? "text-emerald-600" : "text-gray-300"}>Assigned</span>
                        <span className={report.status === "cleaned" ? "text-emerald-600" : "text-gray-300"}>Cleaned</span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100">
                        <div style={{ width: "25%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"></div>
                        <div style={{ width: "25%" }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${["verified_dump", "cleanup_assigned", "cleaned"].includes(report.status) ? "bg-emerald-500" : "bg-transparent"}`}></div>
                        <div style={{ width: "25%" }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${["cleanup_assigned", "cleaned"].includes(report.status) ? "bg-emerald-500" : "bg-transparent"}`}></div>
                        <div style={{ width: "25%" }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${report.status === "cleaned" ? "bg-emerald-500" : "bg-transparent"}`}></div>
                    </div>
                </div>
            )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
            {report.aiValidation?.reasoning ? (
                <button
                    onClick={() => onSelectReport(report)}
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
);

const ReportsTable = ({ reports, loading, emptyMessage, emptyCta, onSelectReport }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">AI Feedback</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                    <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-sm font-medium text-gray-500">Loading reports...</p>
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
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No reports found</h3>
                                <p className="text-sm text-gray-500 max-w-sm mb-6">{emptyMessage}</p>
                                {emptyCta && (
                                    <a href="/citizen/submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
                                        Submit a Report
                                    </a>
                                )}
                            </div>
                        </td>
                    </tr>
                ) : (
                    reports.map((report) => (
                        <ReportRow key={report._id} report={report} onSelectReport={onSelectReport} />
                    ))
                )}
            </tbody>
        </table>
    </div>
);

const VALID_STATUSES = ["pending_validation", "verified_dump", "cleanup_assigned", "cleaned", "rejected"];

const STATUS_LABELS = {
    pending_validation: "Pending",
    verified_dump: "Verified",
    cleanup_assigned: "Assigned",
    cleaned: "Cleaned",
    rejected: "Rejected",
};

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [historyExpanded, setHistoryExpanded] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [statusFilter, setStatusFilter] = useState(searchParams.get("filter") || "");

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

    // Sync filter from URL changes
    useEffect(() => {
        const filter = searchParams.get("filter") || "";
        setStatusFilter(filter);
    }, [searchParams]);

    const clearFilter = () => {
        setStatusFilter("");
        setSearchParams({});
    };

    const allFiltered = statusFilter
        ? reports.filter(r => r.status === statusFilter)
        : reports;

    const activeReports = allFiltered.filter(r => !["cleaned", "rejected"].includes(r.status));
    const previousReports = allFiltered.filter(r => ["cleaned", "rejected"].includes(r.status));

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Reports</h1>
                    <p className="text-gray-500 mt-1">Track your active dump reports and view your community impact history.</p>
                </div>
                {statusFilter && VALID_STATUSES.includes(statusFilter) && (
                    <button
                        onClick={clearFilter}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors self-start"
                    >
                        Showing: <span className="font-bold text-gray-900">{STATUS_LABELS[statusFilter] || statusFilter}</span>
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* ── Active Reports Table ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-emerald-500">⚡</span> Active Reports
                    </h2>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{activeReports.length} pending</span>
                </div>
                <ReportsTable 
                    reports={activeReports} 
                    loading={loadingReports} 
                    emptyMessage="You don't have any active reports right now. When you encounter an illegal dump, snap a photo to get it cleaned up."
                    emptyCta={true}
                    onSelectReport={setSelectedReport}
                />
            </div>

            {/* ── Previous Reports Section ── */}
            {(!loadingReports && previousReports.length > 0) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                        onClick={() => setHistoryExpanded(!historyExpanded)}
                        className="w-full px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-pointer transition-colors hover:bg-gray-100"
                    >
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <CheckSquare size={18} className="text-emerald-500"/> Previous Reports History
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{previousReports.length} completed</span>
                            {historyExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </div>
                    </button>
                    {historyExpanded && (
                        <div className="border-t border-gray-100">
                            <ReportsTable 
                                reports={previousReports} 
                                loading={false} 
                                emptyMessage="No completed history found."
                                emptyCta={false}
                                onSelectReport={setSelectedReport}
                            />
                        </div>
                    )}
                </div>
            )}

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
                                        <span className="text-sm font-medium text-gray-700">{selectedReport.gps?.lat?.toFixed(5) || "N/A"}, {selectedReport.gps?.lng?.toFixed(5) || "N/A"}</span>
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
