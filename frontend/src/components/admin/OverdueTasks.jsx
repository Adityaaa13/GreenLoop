import React from "react";
import { AlertOctagon, Clock, User, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const OverdueTasks = ({ tasks = [] }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-red-100 mb-8 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex-shrink-0 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                    <AlertOctagon size={20} className="text-red-600" />
                    Action Required: Overdue Tasks (&gt;48 Hours)
                </h3>
                <span className="bg-red-200 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                    {tasks.length} Critical
                </span>
            </div>
            
            <div className="p-0 overflow-hidden flex-1">
                {tasks.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {tasks.map((task) => (
                            <div key={task._id} className="p-5 hover:bg-red-50/30 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={task.reportId?.imageUrl} 
                                        alt="Dump location" 
                                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 mb-1">
                                            Task ID: <span className="text-xs font-mono text-gray-500">{task._id}</span>
                                        </p>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5" title="Assigned Worker">
                                                <User size={14} className="text-blue-500" />
                                                {task.workerId?.name}
                                            </div>
                                            <div className="flex items-center gap-1.5" title="Supervising Team Lead">
                                                <Users size={14} className="text-emerald-500" />
                                                {task.teamLeadId?.name}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1.5 rounded-lg text-sm font-medium self-start md:self-auto">
                                    <Clock size={16} />
                                    Assigned {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-center text-gray-500">
                        <div className="bg-green-100 p-3 rounded-full text-green-600 mb-3">
                            <AlertOctagon size={24} />
                        </div>
                        <p className="font-medium text-gray-800">All caught up!</p>
                        <p className="text-sm mt-1 text-gray-400">There are no cleanup tasks stuck beyond 48 hours.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverdueTasks;
