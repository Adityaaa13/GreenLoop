import React, { useState, useEffect } from "react";
import {
    CheckSquare, ChevronDown, ChevronUp, MapPin, Image,
    Clock, ExternalLink, RefreshCw, ClipboardList
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import api from "../../services/api";

/* ───────── Status Config ───────── */
const statusConfig = {
    assigned:        { label: "Pending",      color: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-500" },
    in_progress:     { label: "In Progress",  color: "bg-blue-100 text-blue-700 border-blue-200",         dot: "bg-blue-500" },
    completed:       { label: "Completed",    color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    rework_required: { label: "Rework",       color: "bg-red-100 text-red-700 border-red-200",            dot: "bg-red-500" },
};

/* ───────── Task Card ───────── */
const TaskCard = ({ task }) => {
    const [expanded, setExpanded] = useState(false);
    const cfg = statusConfig[task.status] || statusConfig.completed;
    const gmapsUrl = task.reportId?.gps
        ? `https://www.google.com/maps?q=${task.reportId.gps.lat},${task.reportId.gps.lng}`
        : null;

    return (
        <div className={`rounded-xl border transition-all duration-200 ${expanded ? "border-gray-300 shadow-lg" : "border-gray-100 hover:border-gray-200"}`}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
            >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    {task.reportId?.imageUrl ? (
                        <img src={task.reportId.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Image size={20}/></div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-gray-800 truncate">
                            {task.reportId?.description
                                ? task.reportId.description.length > 40
                                    ? task.reportId.description.slice(0, 40) + "…"
                                    : task.reportId.description
                                : `Cleanup for Report #${(task.reportId?._id || task._id).slice(-5).toUpperCase()}`}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                            {cfg.label}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">
                        Completed {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                        {" · "}
                        <span className="font-mono font-bold tracking-wider opacity-60">Report #{(task.reportId?._id || task._id).slice(-5).toUpperCase()}</span>
                    </p>
                </div>
                <div className="text-gray-400 shrink-0">
                    {expanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </div>
            </button>

            {expanded && (
                <div className="px-4 pb-4 pt-0 space-y-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                    <div className="grid grid-cols-2 gap-3 text-xs pt-3">
                        <div>
                            <p className="text-gray-400 font-medium uppercase tracking-wider mb-0.5">Assigned On</p>
                            <p className="text-gray-700 font-semibold">{format(new Date(task.createdAt), "dd MMM yyyy, h:mm a")}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-medium uppercase tracking-wider mb-0.5">Completed On</p>
                            <p className="text-gray-700 font-semibold">{format(new Date(task.updatedAt), "dd MMM yyyy, h:mm a")}</p>
                        </div>
                    </div>

                    {task.reportId?.imageUrl && (
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Dump Photo (Original)</p>
                            <a href={task.reportId.imageUrl} target="_blank" rel="noopener noreferrer">
                                <img src={task.reportId.imageUrl} alt="Dump" className="w-full rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer" />
                            </a>
                        </div>
                    )}

                    {task.cleanupImage && (
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Cleanup Photo</p>
                            <a href={task.cleanupImage} target="_blank" rel="noopener noreferrer">
                                <img src={task.cleanupImage} alt="Cleanup" className="w-full rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer" />
                            </a>
                        </div>
                    )}

                    {task.reportId?.gps && (
                        <div className="flex items-center gap-2 text-xs">
                            <MapPin size={12} className="text-emerald-600" />
                            <span className="text-gray-600">
                                {task.reportId.gps.lat?.toFixed(5)}, {task.reportId.gps.lng?.toFixed(5)}
                            </span>
                            {gmapsUrl && (
                                <a href={gmapsUrl} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold ml-1">
                                    <ExternalLink size={11} /> Open in Maps
                                </a>
                            )}
                        </div>
                    )}

                    {task.aiValidation?.reasoning && (
                        <div className={`p-3 rounded-lg border text-xs ${task.aiValidation.isClean ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                            <p className="font-bold mb-1 uppercase tracking-wider text-[10px]">
                                {task.aiValidation.isClean ? "✅ AI Approved" : "❌ AI Rejected"}
                                {task.aiValidation.confidence != null && ` (${(task.aiValidation.confidence * 100).toFixed(0)}% confident)`}
                            </p>
                            <p className={task.aiValidation.isClean ? "text-emerald-700" : "text-red-700"}>
                                {task.aiValidation.reasoning}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ───────── Main Page ───────── */
const WorkerPreviousTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get("/tasks/my");
            const all = res.data.tasks || [];
            setTasks(all.filter(t => t.status === "completed"));
        } catch (err) {
            console.error("Error fetching tasks:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Previous Tasks</h1>
                    <p className="text-gray-500 mt-1">All your completed cleanup assignments.</p>
                </div>
                <button
                    onClick={() => { setLoading(true); fetchData(); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors text-sm cursor-pointer"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Summary */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                    <CheckSquare size={24} />
                </div>
                <div>
                    <p className="text-2xl font-black text-emerald-700">{tasks.length}</p>
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Tasks Completed</p>
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {tasks.length > 0 ? tasks.map(task => (
                    <TaskCard key={task._id} task={task} />
                )) : (
                    <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
                        <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="font-semibold">No completed tasks yet.</p>
                        <p className="text-xs mt-1">Complete your first assignment to see it here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkerPreviousTasks;
