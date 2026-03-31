import React, { useState } from "react";
import { Users, User, CheckCircle, AlertCircle, Clock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const TeamPerformanceList = ({ users, tasks }) => {
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

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

    if (selectedEntity) {
        // Filter tasks
        const filteredTasks = tasks.filter(task => {
            const matchesEntity = selectedEntity.type === 'worker' 
                ? (task.workerId?._id || task.workerId) === selectedEntity.data._id
                : (task.teamLeadId?._id || task.teamLeadId) === selectedEntity.data._id;
            
            const matchesStatus = selectedStatusFilter === 'all' || task.status === selectedStatusFilter;
            return matchesEntity && matchesStatus;
        });

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                    <button 
                        onClick={() => setSelectedEntity(null)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            {selectedEntity.data.name}'s Tasks
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                            {selectedStatusFilter === 'all' ? 'All Tasks' : `${selectedStatusFilter.replace('_', ' ')} Tasks`}
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report IDs</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map(task => (
                                    <tr key={task._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-emerald-600">
                                            R: #{task.reportId?._id?.slice(-5).toUpperCase() || "N/A"}<br/>
                                            T: #{task._id.slice(-5).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Assigned: {format(new Date(task.createdAt), "MMM d, HH:mm")}<br/>
                                            {task.updatedAt !== task.createdAt && `Updated: ${format(new Date(task.updatedAt), "MMM d, HH:mm")}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                            {task.reportId?.imageUrl && (
                                                <a href={task.reportId.imageUrl} target="_blank" rel="noopener noreferrer">
                                                    <img src={task.reportId.imageUrl} alt="Original dump" className="h-10 w-10 rounded-md object-cover border" title="Original Dump" />
                                                </a>
                                            )}
                                            {task.cleanupImage && (
                                                <a href={task.cleanupImage} target="_blank" rel="noopener noreferrer">
                                                    <img src={task.cleanupImage} alt="Cleanup" className="h-10 w-10 rounded-md object-cover border border-emerald-500" title="Worker's Cleanup" />
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                  task.status === 'rework_required' ? 'bg-orange-100 text-orange-800' : 
                                                  'bg-blue-100 text-blue-800'}`}>
                                                {task.status.replace("_", " ")}
                                            </span>
                                            {task.aiValidation?.confidence && (
                                                <div className="text-xs text-gray-500 mt-1">AI Conf: {(task.aiValidation.confidence * 100).toFixed(0)}%</div>
                                            )}
                                            {task.aiValidation?.reasoning && (
                                                <div className="text-[10px] text-gray-400 mt-1 max-w-[200px] truncate" title={task.aiValidation.reasoning}>
                                                    {task.aiValidation.reasoning}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No tasks found matching these criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

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
                                <div 
                                    className="bg-emerald-50/50 px-6 py-4 border-b border-gray-100 flex items-start flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-emerald-100/50 transition-colors"
                                    onClick={() => { setSelectedEntity({ type: 'team_lead', data: lead }); setSelectedStatusFilter('all'); }}
                                    title="View all tasks supervised by this Team Lead"
                                >
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
                                                    <div className="flex items-center gap-4 text-sm mt-3 md:mt-0">
                                                        <div 
                                                            onClick={() => { setSelectedEntity({ type: 'worker', data: worker }); setSelectedStatusFilter('completed'); }}
                                                            className="flex items-center gap-1.5 text-green-600 cursor-pointer hover:bg-green-50 px-2 py-1 rounded transition-colors" 
                                                            title="View Completed Tasks"
                                                        >
                                                            <CheckCircle size={16} /> 
                                                            <span className="font-semibold">{stats.completed}</span>
                                                        </div>
                                                        <div 
                                                            onClick={() => { setSelectedEntity({ type: 'worker', data: worker }); setSelectedStatusFilter('rework_required'); }}
                                                            className="flex items-center gap-1.5 text-orange-600 cursor-pointer hover:bg-orange-50 px-2 py-1 rounded transition-colors" 
                                                            title="View Rework Tasks"
                                                        >
                                                            <AlertCircle size={16} /> 
                                                            <span className="font-semibold">{stats.rework}</span>
                                                        </div>
                                                        <div 
                                                            onClick={() => { setSelectedEntity({ type: 'worker', data: worker }); setSelectedStatusFilter('assigned'); }}
                                                            className="flex items-center gap-1.5 text-blue-600 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors" 
                                                            title="View Pending Tasks"
                                                        >
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
