import React from "react";
import { Users, User, CheckCircle, AlertCircle, Clock } from "lucide-react";

const TeamPerformanceList = ({ users, tasks }) => {
    // 1. Separate Team Leads and Workers
    const teamLeads = users.filter((u) => u.role === "team_lead");
    const workers = users.filter((u) => u.role === "worker");

    // 2. Aggregate task data per worker
    const workerStats = {};
    workers.forEach(w => {
        workerStats[w._id] = { completed: 0, rework: 0, assigned: 0 };
    });

    tasks.forEach(task => {
        const wid = task.workerId?._id || task.workerId;
        if (workerStats[wid]) {
            if (task.status === "completed") workerStats[wid].completed++;
            else if (task.status === "rework_required") workerStats[wid].rework++;
            else workerStats[wid].assigned++;
        }
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Users size={20} className="text-emerald-600" />
                    Team Hierarchy & Performance
                </h3>
            </div>

            <div className="p-6 space-y-8">
                {teamLeads.length > 0 ? (
                    teamLeads.map((lead) => {
                        const myWorkers = workers.filter(w => {
                            const tlid = typeof w.teamLeadId === 'object' ? w.teamLeadId._id : w.teamLeadId;
                            return tlid === lead._id;
                        });

                        return (
                            <div key={lead._id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                {/* Team Lead Header */}
                                <div className="bg-emerald-50/50 px-6 py-4 border-b border-gray-100 flex items-start flex-col sm:flex-row sm:items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-200 text-emerald-800 p-2 rounded-lg">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">{lead.name}</h4>
                                            <p className="text-sm text-gray-500">Team Lead • {lead.email}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 sm:mt-0 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600">
                                        {myWorkers.length} Workers Assigned
                                    </div>
                                </div>

                                {/* Workers List */}
                                <div className="divide-y divide-gray-100 bg-white">
                                    {myWorkers.length > 0 ? (
                                        myWorkers.map((worker) => {
                                            const stats = workerStats[worker._id] || { completed: 0, rework: 0, assigned: 0 };
                                            return (
                                                <div key={worker._id} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3 mb-3 md:mb-0">
                                                        <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                                                            <User size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{worker.name}</p>
                                                            <p className="text-xs text-gray-500">{worker.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-1.5 text-green-600" title="Completed Tasks">
                                                            <CheckCircle size={16} /> 
                                                            <span className="font-semibold">{stats.completed}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-orange-600" title="Rework Required">
                                                            <AlertCircle size={16} /> 
                                                            <span className="font-semibold">{stats.rework}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-blue-600" title="Pending Tasks">
                                                            <Clock size={16} /> 
                                                            <span className="font-semibold">{stats.assigned}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-6 py-6 text-center text-sm text-gray-500 italic">
                                            No workers assigned to this team lead.
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        No team leads found in the system.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamPerformanceList;
