import React, { useState, useEffect } from "react";
import { Send, MapPin, UserSquare2, CheckSquare, Clock, AlignLeft, BarChart2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import api from "../../services/api";

const TaskAssignmentItem = ({ report, workers, onAssign }) => {
    const [selectedWorkerId, setSelectedWorkerId] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedWorkerId) return;
        setIsSubmitting(true);
        await onAssign(report._id, selectedWorkerId, notes);
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white border text-left border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row mb-4 transition-all hover:shadow-md">
            {/* Image side */}
            <div className="w-full md:w-48 shrink-0 bg-gray-100 flex items-center justify-center">
                <img 
                    src={report.imageUrl} 
                    alt="Verified Dump" 
                    className="w-full h-48 md:h-full object-cover"
                />
            </div>
            
            {/* Details side */}
            <div className="p-5 flex-1 flex flex-col justify-center">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 mr-4">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wide">
                            <MapPin size={16} className="text-emerald-500 shrink-0" />
                            {report.location || `Target Zone #${report._id.slice(-6)}`}
                        </h4>
                        
                        <div className="text-xs text-gray-600 mt-2.5 pl-5 space-y-2">
                            {report.description && (
                                <p className="flex items-start gap-1.5 text-gray-700 italic border-l-2 border-gray-200 pl-2">
                                    <AlignLeft size={13} className="shrink-0 mt-0.5 text-gray-400" />
                                    <span className="line-clamp-2">{report.description}</span>
                                </p>
                            )}
                            <div className="flex items-center gap-4 flex-wrap">
                                <p className="flex items-center gap-1.5">
                                    <Clock size={13} className="text-gray-400" />
                                    <span className="font-semibold text-gray-700">Reported:</span> 
                                    {report.createdAt ? format(new Date(report.createdAt), "MMM d, yyyy, h:mm a") : "N/A"}
                                    {report.createdAt && <span className="text-gray-400">({formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })})</span>}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                                {report.gps && report.gps.lat && (
                                    <p className="flex items-center gap-1.5">
                                        <MapPin size={13} className="text-gray-400" />
                                        <span className="font-semibold text-gray-700">GPS:</span> 
                                        {report.gps.lat.toFixed(4)}, {report.gps.lng.toFixed(4)}
                                    </p>
                                )}
                                <p className="flex items-center gap-1.5">
                                    <BarChart2 size={13} className="text-gray-400" />
                                    <span className="font-semibold text-gray-700">AI Confidence:</span>
                                    <span className={report.aiConfidence > 0.8 ? "text-emerald-600 font-bold" : "text-yellow-600 font-bold"}>
                                        {report.aiConfidence ? (report.aiConfidence * 100).toFixed(0) + "%" : "N/A"}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <span className="shrink-0 bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-semibold border border-yellow-200">
                        Pending Dispatch
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <select 
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={selectedWorkerId} 
                            onChange={(e) => setSelectedWorkerId(e.target.value)}
                            required
                        >
                            <option value="" disabled>1. Select Worker...</option>
                            {workers.map(w => (
                                <option key={w._id} value={w._id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex-1 min-w-[200px]">
                        <input 
                            type="text"
                            placeholder="2. Optional Ops Notes..."
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting || !selectedWorkerId}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                    >
                        {isSubmitting ? "..." : "Assign"}
                        <Send size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
};

const TaskAssignment = () => {
    const [reports, setReports] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchAssignmentData = async () => {
            try {
                const [repRes, workRes] = await Promise.all([
                    api.get("/reports"),
                    api.get("/dashboard/team-lead/workers")
                ]);
                
                // Get strictly genuine unassigned
                const unassignedDumps = (repRes.data.reports || repRes.data).filter(
                    r => r.status === "verified_dump"
                );
                
                setReports(unassignedDumps);
                setWorkers(workRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load assignment data:", error);
                setLoading(false);
            }
        };
        fetchAssignmentData();
    }, []);

    const handleAssign = async (reportId, workerId, notes) => {
        setMessage(null);
        try {
            await api.post("/tasks/assign", { reportId, workerId, assignedNotes: notes });
            setMessage({ type: "success", text: `Target Zone #${reportId.slice(-6).toUpperCase()} assigned successfully!` });
            
            // Remove from list
            setReports(prev => prev.filter(r => r._id !== reportId));
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Assignment failed." });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Assign Work</h1>
                <p className="text-gray-500 mt-2">Simplify dispatch by assigning genuine dumps directly to your squad.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium mb-8 flex items-center justify-between ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100 text-xl font-bold">&times;</button>
                </div>
            )}

            <div className="space-y-4">
                {reports.length > 0 ? (
                    reports.map(report => (
                        <TaskAssignmentItem 
                            key={report._id} 
                            report={report} 
                            workers={workers} 
                            onAssign={handleAssign} 
                        />
                    ))
                ) : (
                    <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckSquare size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Queue Empty</h3>
                        <p className="text-gray-500">There are no unassigned verified dumps remaining. Great job!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskAssignment;
