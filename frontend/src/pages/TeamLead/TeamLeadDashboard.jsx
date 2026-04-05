import React, { useState, useEffect, useRef } from "react";
import {
    ClipboardList, CheckSquare, AlertTriangle, Users, ArrowRight, 
    TrendingUp, Eye, RefreshCw, ChevronDown, ChevronUp, MapPin, Image
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import api from "../../services/api";

const statusConfig = {
    assigned:        { label: "Waiting",     color: "bg-blue-100 text-blue-700 border-blue-200",      dot: "bg-blue-500",    bar: "bg-blue-500" },
    in_progress:     { label: "In Progress", color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500 animate-pulse", bar: "bg-orange-500" },
    completed:       { label: "Completed",   color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", bar: "bg-emerald-500" },
    rework_required: { label: "Rework",      color: "bg-red-100 text-red-700 border-red-200",          dot: "bg-red-500",     bar: "bg-red-500" },
};

/* ───────────────────── Expandable Task Card ───────────────────── */
const TaskCard = ({ task, squad = [], onReassign }) => {
    const [expanded, setExpanded] = useState(false);
    const [reassigningTo, setReassigningTo] = useState("");
    const cfg = statusConfig[task.status] || statusConfig.assigned;

    return (
        <div className={`rounded-xl border transition-all ${expanded ? "border-gray-300 shadow-md" : "border-gray-100 hover:border-gray-200"}`}>
            {/* Main Row */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-4 p-4 text-left"
            >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    {task.reportId?.imageUrl ? (
                        <img src={task.reportId.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Image size={18}/></div>
                    )}
                </div>

                {/* Info */}
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
                        <span className="font-semibold text-gray-600">{task.workerId?.name || "Unassigned"}</span>
                        {" · "}
                        {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                        {" · "}
                        <span className="font-mono font-bold tracking-wider opacity-60">Report #{(task.reportId?._id || task._id).slice(-5).toUpperCase()}</span>
                    </p>
                </div>

                {/* Chevron */}
                <div className="text-gray-400 shrink-0">
                    {expanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </div>
            </button>

            {/* Expanded Detail */}
            {expanded && (
                <div className="px-4 pb-4 pt-0 space-y-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                    <div className="grid grid-cols-2 gap-3 text-xs pt-3">
                        <div>
                            <p className="text-gray-400 font-medium uppercase tracking-wider mb-0.5">First Opened</p>
                            <p className="text-gray-700 font-semibold">{format(new Date(task.createdAt), "dd MMM yyyy, h:mm a")}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-medium uppercase tracking-wider mb-0.5">Last Assigned / Updated</p>
                            <p className="text-gray-700 font-semibold">{format(new Date(task.updatedAt), "dd MMM yyyy, h:mm a")}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-400 font-medium uppercase tracking-wider mb-0.5">Worker Email</p>
                            <p className="text-gray-700 font-semibold">{task.workerId?.email || "N/A"}</p>
                        </div>
                    </div>

                    {/* Show AI validation result if the task has been attempted */}
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

                    {/* Show cleanup image if submitted */}
                    {task.cleanupImage && (
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Worker's Cleanup Photo</p>
                            <a href={task.cleanupImage} target="_blank" rel="noopener noreferrer">
                                <img src={task.cleanupImage} alt="Cleanup" className="w-full rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer" />
                            </a>
                        </div>
                    )}

                    {/* GPS info */}
                    {task.reportId?.gps && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin size={12} />
                            <span>Original: {task.reportId.gps.lat?.toFixed(4)}, {task.reportId.gps.lng?.toFixed(4)}</span>
                            {task.cleanupGps?.lat && (
                                <span className="ml-2">| Cleanup: {task.cleanupGps.lat?.toFixed(4)}, {task.cleanupGps.lng?.toFixed(4)}</span>
                            )}
                        </div>
                    )}

                    {/* Reassign Worker (For Reworks) */}
                    {task.status === "rework_required" && onReassign && squad.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Reassign Rework Task</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <select 
                                    value={reassigningTo}
                                    onChange={(e) => setReassigningTo(e.target.value)}
                                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                >
                                    <option value="" disabled>Select new worker</option>
                                    {squad.map(w => (
                                        <option key={w._id} value={w._id}>{w.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => {
                                        if (reassigningTo) {
                                            if(window.confirm("Are you sure you want to reassign this task? The new worker will start from scratch.")) {
                                                onReassign(task._id, reassigningTo);
                                                setReassigningTo("");
                                            }
                                        }
                                    }}
                                    disabled={!reassigningTo}
                                    className="bg-red-600 disabled:bg-red-300 hover:bg-red-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors"
                                >
                                    Transfer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ───────────────────── Completion Ring ───────────────────── */
const CompletionRing = ({ rate }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (rate / 100) * circumference;
    return (
        <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90">
                <circle cx="56" cy="56" r={radius} strokeWidth="8" fill="none" className="stroke-gray-200" />
                <circle
                    cx="56" cy="56" r={radius} strokeWidth="8" fill="none"
                    className="stroke-emerald-500 transition-all duration-1000"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-800">{rate}%</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Success</span>
            </div>
        </div>
    );
};

/* ───────────────────── Main Dashboard ───────────────────── */
const TeamLeadDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");

    const taskListRef = useRef(null);

    const handleMetricClick = (tab) => {
        setActiveTab(tab);
        taskListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const fetchData = async () => {
        try {
            const res = await api.get("/dashboard/team-lead");
            setStats(res.data);
        } catch (err) {
            console.error("Dashboard load failed:", err);
            setError("Unable to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const handleReassign = async (taskId, newWorkerId) => {
        try {
            await api.put(`/tasks/reassign/${taskId}`, { newWorkerId });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to reassign task");
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

    if (error) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl">{error}</div>
            </div>
        );
    }

    const {
        assignedTasks = 0, completedTasks = 0, reworkTasks = 0,
        workerPerformance = [], recentTasks = []
    } = stats;

    const totalTasks = assignedTasks + completedTasks + reworkTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const filteredTasks = recentTasks.filter(t => {
        const matchesTab = activeTab === "all"
            ? t.status !== "completed"
            : activeTab === "completed"
                ? t.status === "completed"
                : t.status === activeTab;
        return matchesTab;
    });

    const tabCounts = {
        all: recentTasks.filter(t => t.status !== "completed").length,
        assigned: recentTasks.filter(t => t.status === "assigned").length,
        rework_required: recentTasks.filter(t => t.status === "rework_required").length,
        completed: recentTasks.filter(t => t.status === "completed").length,
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* ───── Header ───── */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Command Center</h1>
                    <p className="text-gray-500 mt-1">Real-time status of your cleanup operations.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setLoading(true); fetchData(); }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors text-sm"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <Link
                        to="/team-lead/assign"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm text-sm"
                    >
                        Assign Work <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            {/* ───── Stats + Ring Row ───── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                {/* Completion Ring */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <CompletionRing rate={completionRate} />
                    <p className="text-xs text-gray-400 font-semibold mt-2 uppercase tracking-wider">
                        {completedTasks} of {totalTasks} Tasks
                    </p>
                </div>

                {/* Metric Cards */}
                <div className="lg:col-span-3 grid grid-cols-3 gap-4">
                    {[
                        { label: "Active Tasks", value: assignedTasks, icon: ClipboardList, accent: "blue",    tab: "all" },
                        { label: "Completed",    value: completedTasks, icon: CheckSquare,   accent: "emerald", tab: "completed" },
                        { label: "Rework",       value: reworkTasks,    icon: AlertTriangle,  accent: "red",     tab: "rework_required" },
                    ].map(({ label, value, icon: Icon, accent, tab }) => (
                        <div
                            key={label}
                            onClick={() => handleMetricClick(tab)}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`bg-${accent}-100 p-2.5 rounded-xl text-${accent}-600 group-hover:scale-110 transition-transform`}><Icon size={20} /></div>
                            </div>
                            <p className="text-3xl font-black text-gray-800">{value}</p>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ───── Two Column: Task Tracker + Squad ───── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Task Tracker */}
                <div className="lg:col-span-2 space-y-6" ref={taskListRef}>
                    {/* Active Tasks */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Eye size={18} className="text-gray-500"/> Active Tasks
                            </h2>
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{tabCounts.all} tasks</span>
                        </div>

                        {/* Filters */}
                        <div className="px-6 py-4 bg-white">
                            <div className="flex gap-2 flex-wrap">
                                {Object.entries({ all: "All Active", assigned: "Waiting", rework_required: "Rework", completed: "Completed" }).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                            activeTab === key
                                                ? "bg-gray-800 text-white border-gray-800 shadow-sm"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                                        }`}
                                    >
                                        {label} ({tabCounts[key]})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scrollable Task List */}
                        <div className="p-4 space-y-2 flex-1 max-h-[550px] overflow-y-auto">
                            {filteredTasks.length > 0 ? filteredTasks.map(task => (
                                <TaskCard 
                                    key={task._id} 
                                    task={task} 
                                    squad={workerPerformance.map(wp => wp._id).filter(Boolean)} 
                                    onReassign={handleReassign} 
                                />
                            )) : (
                                <div className="text-center py-16 text-gray-400">
                                    <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
                                    <p className="font-semibold">No active tasks right now.</p>
                                    <p className="text-xs mt-1">All caught up! 🎉</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Squad Panel */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <Users className="text-emerald-600" size={18} />
                        <h2 className="text-lg font-bold text-gray-800">My Squad</h2>
                        <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{workerPerformance.length}</span>
                    </div>

                    <div className="p-4 space-y-3 flex-1 max-h-[550px] overflow-y-auto">
                        {workerPerformance.length > 0 ? workerPerformance.map((worker) => {
                            const isIdle = worker.active === 0;
                            const workerTotal = worker.totalAssigned || 1;
                            const donePercent = Math.round((worker.completed / workerTotal) * 100);
                            return (
                                <div key={worker._id?._id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${isIdle ? "bg-gray-400" : "bg-emerald-600"}`}>
                                            {worker._id?.name?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{worker._id?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{worker._id?.email}</p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isIdle ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isIdle ? "bg-gray-400" : "bg-emerald-500 animate-pulse"}`}></span>
                                            {isIdle ? "Free" : `${worker.active} Active`}
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mb-2">
                                        <div className="flex justify-between text-[10px] font-semibold text-gray-400 mb-1">
                                            <span>{worker.completed} / {worker.totalAssigned} tasks done</span>
                                            <span>{donePercent}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                style={{ width: `${donePercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Mini stats */}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-blue-50 rounded-lg py-1.5">
                                            <p className="text-xs font-black text-blue-700">{worker.active}</p>
                                            <p className="text-[10px] text-blue-500 font-medium">Active</p>
                                        </div>
                                        <div className="bg-emerald-50 rounded-lg py-1.5">
                                            <p className="text-xs font-black text-emerald-700">{worker.completed}</p>
                                            <p className="text-[10px] text-emerald-500 font-medium">Done</p>
                                        </div>
                                        <div className="bg-red-50 rounded-lg py-1.5">
                                            <p className="text-xs font-black text-red-700">{worker.rework}</p>
                                            <p className="text-[10px] text-red-500 font-medium">Rework</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-16 text-gray-400">
                                <Users size={40} className="mx-auto mb-3 opacity-40" />
                                <p className="font-semibold">No workers assigned yet.</p>
                                <p className="text-xs mt-1">Ask your Admin to add workers under your account.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamLeadDashboard;
