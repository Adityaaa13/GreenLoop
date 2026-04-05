import React, { useState, useEffect, useRef } from "react";
import {
    ClipboardList, CheckSquare, AlertTriangle, Briefcase, RefreshCw,
    ChevronDown, ChevronUp, MapPin, Image, Upload, Camera, Loader2,
    Sparkles, Clock, ExternalLink, Shield, Lightbulb, TriangleAlert
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import api from "../../services/api";

/* ───────── Status Config ───────── */
const statusConfig = {
    assigned:        { label: "Pending",      color: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-500 animate-pulse", icon: Clock },
    in_progress:     { label: "In Progress",  color: "bg-blue-100 text-blue-700 border-blue-200",         dot: "bg-blue-500 animate-pulse",    icon: Loader2 },
    completed:       { label: "Completed",    color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500",               icon: CheckSquare },
    rework_required: { label: "Rework",       color: "bg-red-100 text-red-700 border-red-200",            dot: "bg-red-500",                   icon: AlertTriangle },
};

/* ───────── Completion Ring (SVG) ───────── */
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

/* ───────── Cleanup Upload Form ───────── */
const CleanupUploadForm = ({ taskId, onComplete }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [gps, setGps] = useState(null);
    const [gpsError, setGpsError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const fileRef = useRef(null);

    // Auto-capture GPS on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => setGpsError("Unable to get GPS. Please enable location services."),
                { enableHighAccuracy: true, timeout: 15000 }
            );
        } else {
            setGpsError("Geolocation not supported by your browser.");
        }
    }, []);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
            setResult(null);
        }
    };

    const handleSubmit = async () => {
        if (!file || !gps) return;
        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("image", file);
        formData.append("taskId", taskId);
        formData.append("lat", gps.lat);
        formData.append("lng", gps.lng);

        try {
            const res = await api.post("/tasks/upload-cleanup", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 120000, // 2 min timeout for AI processing
            });
            setResult({ success: true, message: res.data.message, task: res.data.task });
            onComplete?.();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Upload failed";
            setResult({ success: false, message: msg, task: err.response?.data?.task });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mt-3 p-4 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 space-y-3">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <Camera size={14} /> Upload Cleanup Proof
            </p>

            {/* File Picker */}
            <div
                onClick={() => fileRef.current?.click()}
                className="cursor-pointer border border-emerald-200 rounded-lg p-4 bg-white hover:bg-emerald-50 transition-colors flex flex-col items-center gap-2"
            >
                {preview ? (
                    <img src={preview} alt="Preview" className="w-full max-h-36 object-cover rounded-lg" />
                ) : (
                    <>
                        <Upload size={24} className="text-emerald-400" />
                        <p className="text-xs text-gray-500 font-medium">Click to select cleanup photo</p>
                    </>
                )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />

            {/* GPS Status */}
            <div className="flex items-center gap-2 text-xs">
                <MapPin size={12} className={gps ? "text-emerald-600" : "text-gray-400"} />
                {gps ? (
                    <span className="text-emerald-700 font-medium">
                        GPS locked: {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
                    </span>
                ) : gpsError ? (
                    <span className="text-red-600 font-medium">{gpsError}</span>
                ) : (
                    <span className="text-gray-400 font-medium">Acquiring GPS...</span>
                )}
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!file || !gps || uploading}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    !file || !gps || uploading
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
                }`}
            >
                {uploading ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        AI is validating...
                    </>
                ) : (
                    <>
                        <Sparkles size={16} />
                        Submit for AI Validation
                    </>
                )}
            </button>

            {/* Result */}
            {result && (
                <div className={`p-3 rounded-lg border text-xs ${result.success ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"}`}>
                    <p className="font-bold mb-1">
                        {result.success ? "✅ Cleanup Approved!" : "❌ Cleanup Rejected"}
                    </p>
                    <p className={result.success ? "text-emerald-700" : "text-red-700"}>{result.message}</p>
                    {result.task?.aiValidation?.reasoning && (
                        <p className="mt-1 text-gray-600 italic">AI: {result.task.aiValidation.reasoning}</p>
                    )}
                </div>
            )}
        </div>
    );
};

/* ───────── Expandable Task Card ───────── */
const TaskCard = ({ task, onTaskUpdate }) => {
    const [expanded, setExpanded] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const cfg = statusConfig[task.status] || statusConfig.assigned;
    const StatusIcon = cfg.icon;

    const canUpload = task.status === "assigned" || task.status === "in_progress" || task.status === "rework_required";
    const gmapsUrl = task.reportId?.gps
        ? `https://www.google.com/maps?q=${task.reportId.gps.lat},${task.reportId.gps.lng}`
        : null;

    return (
        <div className={`rounded-xl border transition-all duration-200 ${expanded ? "border-gray-300 shadow-lg" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"}`}>
            {/* Main Row */}
            <button
                onClick={() => { setExpanded(!expanded); if (expanded) setShowUpload(false); }}
                className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
            >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    {task.reportId?.imageUrl ? (
                        <img src={task.reportId.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Image size={20}/></div>
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
                        <span className="font-semibold text-gray-600">Assigned by {task.teamLeadId?.name || "Team Lead"}</span>
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
                    {/* Detail Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs pt-3">
                        <div>
                            <p className="text-gray-400 font-medium uppercase tracking-wider mb-0.5">First Opened</p>
                            <p className="text-gray-700 font-semibold">{format(new Date(task.createdAt), "dd MMM yyyy, h:mm a")}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-medium uppercase tracking-wider mb-0.5">Last Assigned / Updated</p>
                            <p className="text-gray-700 font-semibold">{format(new Date(task.updatedAt), "dd MMM yyyy, h:mm a")}</p>
                        </div>
                    </div>

                    {/* Dump Image (full) */}
                    {task.reportId?.imageUrl && (
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Dump Photo (Original)</p>
                            <a href={task.reportId.imageUrl} target="_blank" rel="noopener noreferrer">
                                <img src={task.reportId.imageUrl} alt="Dump" className="w-full rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer" />
                            </a>
                        </div>
                    )}

                    {/* Description */}
                    {task.reportId?.description && (
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Description</p>
                            <p className="text-xs text-gray-600">{task.reportId.description}</p>
                        </div>
                    )}

                    {/* GPS + Map Link */}
                    {task.reportId?.gps && (
                        <div className="flex items-center gap-2 text-xs">
                            <MapPin size={12} className="text-emerald-600" />
                            <span className="text-gray-600">
                                {task.reportId.gps.lat?.toFixed(5)}, {task.reportId.gps.lng?.toFixed(5)}
                            </span>
                            {gmapsUrl && (
                                <a
                                    href={gmapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold ml-1"
                                >
                                    <ExternalLink size={11} /> Open in Maps
                                </a>
                            )}
                        </div>
                    )}

                    {/* AI validation result (if task was attempted) */}
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

                    {/* Worker's Cleanup Photo (if submitted) */}
                    {task.cleanupImage && (
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Your Cleanup Photo</p>
                            <a href={task.cleanupImage} target="_blank" rel="noopener noreferrer">
                                <img src={task.cleanupImage} alt="Cleanup" className="w-full rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer" />
                            </a>
                        </div>
                    )}

                    {/* Upload / Re-upload button */}
                    {canUpload && !showUpload && (
                        <button
                            onClick={() => setShowUpload(true)}
                            className="w-full py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Camera size={16} />
                            {task.status === "rework_required" ? "Re-upload Cleanup Photo" : "Upload Cleanup Photo"}
                        </button>
                    )}

                    {/* Upload Form */}
                    {canUpload && showUpload && (
                        <CleanupUploadForm
                            taskId={task._id}
                            onComplete={onTaskUpdate}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

/* ───────────────────── Previous Tasks Section ───────────────────── */
const PreviousTasksSection = ({ tasks }) => {
    const [expanded, setExpanded] = useState(false);

    if (tasks.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-pointer"
            >
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <CheckSquare size={18} className="text-emerald-500"/> Previous Tasks
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{tasks.length} completed</span>
                    {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </button>
            {expanded && (
                <div className="p-4 space-y-2 max-h-[450px] overflow-y-auto">
                    {tasks.map(task => (
                        <TaskCard key={task._id} task={task} onTaskUpdate={() => {}} />
                    ))}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════ */
/*              MAIN DASHBOARD                */
/* ═══════════════════════════════════════════ */
const WorkerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");

    const fetchData = async () => {
        try {
            const [statsRes, tasksRes] = await Promise.all([
                api.get("/dashboard/worker"),
                api.get("/tasks/my"),
            ]);
            setStats(statsRes.data);
            setTasks(tasksRes.data.tasks || []);
        } catch (err) {
            console.error("Worker dashboard error:", err);
            setError("Unable to load dashboard. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const refresh = () => { setLoading(true); setError(null); fetchData(); };

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

    const { totalAssigned = 0, active = 0, completed = 0, rework = 0, completionRate = 0 } = stats || {};

    const filteredTasks = activeTab === "all"
        ? tasks.filter(t => t.status !== "completed")
        : activeTab === "active"
            ? tasks.filter(t => t.status === "assigned" || t.status === "in_progress")
            : tasks.filter(t => t.status === activeTab);

    const tabCounts = {
        all: tasks.filter(t => t.status !== "completed").length,
        active: tasks.filter(t => t.status === "assigned" || t.status === "in_progress").length,
        rework_required: tasks.filter(t => t.status === "rework_required").length,
        completed: tasks.filter(t => t.status === "completed").length,
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* ───── Header ───── */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Assignments</h1>
                    <p className="text-gray-500 mt-1">View your tasks, upload cleanup proof, and track your progress.</p>
                </div>
                <button
                    onClick={refresh}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors text-sm cursor-pointer"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* ───── Stats Row ───── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Completion Ring */}
                <div 
                    onClick={() => setActiveTab("all")}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-300 hover:ring-2 hover:ring-emerald-100 hover:-translate-y-0.5 transition-all"
                >
                    <CompletionRing rate={completionRate} />
                    <p className="text-xs text-gray-400 font-semibold mt-2 uppercase tracking-wider">
                        {completed} of {totalAssigned} Done
                    </p>
                </div>

                {/* Metric Cards */}
                <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Tasks",  value: totalAssigned, icon: Briefcase,      accent: "gray",    action: () => setActiveTab("all") },
                        { label: "Active Now",   value: active,        icon: ClipboardList,   accent: "blue",    action: () => setActiveTab("active") },
                        { label: "Completed",    value: completed,     icon: CheckSquare,     accent: "emerald", action: () => setActiveTab("completed") },
                        { label: "Rework",       value: rework,        icon: AlertTriangle,   accent: "red",     action: () => setActiveTab("rework_required") },
                    ].map(({ label, value, icon: Icon, accent, action }) => (
                        <div 
                            key={label} 
                            onClick={action}
                            className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-${accent}-300 hover:ring-2 hover:ring-${accent}-100 hover:-translate-y-0.5 transition-all group`}
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

            {/* ───── Two Column: Tasks + Tips ───── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Task List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tasks List Container */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <ClipboardList size={18} className="text-gray-500"/> Tasks
                            </h2>
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {tabCounts[activeTab]} results
                            </span>
                        </div>

                        {/* Filter Tabs */}
                        <div className="px-6 pt-4 flex gap-2 flex-wrap">
                            {[
                                ["all", "All Active"],
                                ["active", "In Progress"],
                                ["rework_required", "Rework"],
                                ["completed", "Completed History"]
                            ].map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                                        activeTab === key
                                            ? "bg-gray-800 text-white border-gray-800"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                                    }`}
                                >
                                    {label} ({tabCounts[key]})
                                </button>
                            ))}
                        </div>

                        {/* Scrollable Task List */}
                        <div className="p-4 space-y-2 flex-1 max-h-[650px] overflow-y-auto">
                            {filteredTasks.length > 0 ? filteredTasks.map(task => (
                                <TaskCard key={task._id} task={task} onTaskUpdate={refresh} />
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

                {/* Right: Quick Tips + Status Summary */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Rework Alert (conditional) */}
                    {rework > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
                            <TriangleAlert className="text-red-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-sm font-bold text-red-700">Attention Required</p>
                                <p className="text-xs text-red-600 mt-1">
                                    You have <span className="font-bold">{rework}</span> task{rework > 1 ? "s" : ""} that need re-cleaning.
                                    Expand the task and re-upload a new cleanup photo.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Quick Tips */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                            <Lightbulb className="text-amber-500" size={18} />
                            <h2 className="text-lg font-bold text-gray-800">Quick Tips</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            {[
                                {
                                    icon: MapPin,
                                    title: "Be at the exact location",
                                    desc: "GPS should be within 150m of the original dump. Stay close to the site when uploading.",
                                    color: "emerald"
                                },
                                {
                                    icon: Camera,
                                    title: "Take clear photos",
                                    desc: "Make sure the cleaned area is fully visible. Avoid blurry or dark images.",
                                    color: "blue"
                                },
                                {
                                    icon: Sparkles,
                                    title: "AI validates your work",
                                    desc: "Our AI checks if the area looks clean. If rejected, you can re-upload with a better photo.",
                                    color: "purple"
                                },
                                {
                                    icon: Shield,
                                    title: "Rework is normal",
                                    desc: "If AI rejects, don't worry — just go back, clean more thoroughly, and re-upload.",
                                    color: "amber"
                                },
                            ].map(({ icon: TipIcon, title, desc, color }) => (
                                <div key={title} className="flex gap-3">
                                    <div className={`bg-${color}-100 p-2 rounded-lg text-${color}-600 shrink-0 h-fit`}>
                                        <TipIcon size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">{title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white">
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                            <Sparkles size={16} /> How Cleanup Works
                        </h3>
                        <ol className="space-y-2.5 text-xs">
                            {[
                                "Open an assigned task and check the dump location.",
                                "Go to the location and clean up the garbage.",
                                "Take a photo of the cleaned area.",
                                "Upload the photo — AI validates automatically.",
                                "If approved, the task is marked complete!",
                            ].map((step, i) => (
                                <li key={i} className="flex gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                                    <span className="text-emerald-100 leading-snug">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;
