import React from "react";
import { format } from "date-fns";

const VerifiedDumpsTable = ({ reports }) => {
    // Helper to render fancy status badges
    const getStatusBadge = (status) => {
        const statuses = {
            "pending_validation": "bg-yellow-100 text-yellow-800",
            "verified_dump": "bg-blue-100 text-blue-800",
            "rejected": "bg-red-100 text-red-800",
            "cleanup_assigned": "bg-purple-100 text-purple-800",
            "cleaned": "bg-green-100 text-green-800",
        };
        const defaultClass = "bg-gray-100 text-gray-800";
        return `px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statuses[status] || defaultClass}`;
    };

    const getTaskStatusBadge = (status) => {
        const statuses = {
            "assigned": "bg-blue-100 text-blue-700",
            "in_progress": "bg-orange-100 text-orange-700",
            "completed": "bg-green-100 text-green-700",
            "rework_required": "bg-red-100 text-red-700",
        };
        const defaultClass = "bg-gray-100 text-gray-600";
        return `px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statuses[status] || defaultClass}`;
    };

    // Expose all reports, removing previous verified filter, falling back to empty array
    const allReports = reports || [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">System Reports Overview</h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported On</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed On</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location & Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Lead</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {allReports.length > 0 ? (
                            allReports.map((report) => (
                                <tr key={report._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold font-mono text-emerald-600">
                                        #{report._id.slice(-5).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(report.createdAt), "MMM d, yyyy HH:mm")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        {report.status === "cleaned" ? format(new Date(report.updatedAt), "MMM d, yyyy HH:mm") : <span className="text-gray-300">-</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {report.citizenId?.name || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <a href={report.imageUrl} target="_blank" rel="noopener noreferrer">
                                                <img className="h-10 w-10 rounded-md object-cover border" src={report.imageUrl} alt="Dump" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 truncate max-w-[150px]">
                                            {report.description || <span className="text-gray-400 italic">No description</span>}
                                        </div>
                                        {report.gps && (
                                            <a 
                                                href={`https://www.google.com/maps?q=${report.gps.lat},${report.gps.lng}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 mt-1 font-medium"
                                            >
                                                View on Maps
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={getStatusBadge(report.status)}>
                                            {report.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {report.task?.teamLead?.name || <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {report.task?.worker?.name || <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {report.task ? (
                                            <span className={getTaskStatusBadge(report.task.status)}>
                                                {report.task.status.replace("_", " ")}
                                            </span>
                                        ) : <span className="text-gray-300 text-sm">—</span>}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No reports found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VerifiedDumpsTable;
