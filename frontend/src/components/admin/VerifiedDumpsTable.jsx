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

    // Filter to only show genuine, verified reports to the Admin
    const genuineReports = reports?.filter(r => 
        ["verified_dump", "cleanup_assigned", "cleaned"].includes(r.status)
    ) || [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">System Reports Overview</h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Confidence</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {genuineReports.length > 0 ? (
                            genuineReports.map((report) => (
                                <tr key={report._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(report.createdAt), "MMM d, yyyy HH:mm")}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {report.aiConfidence ? (report.aiConfidence * 100).toFixed(0) + "%" : "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={getStatusBadge(report.status)}>
                                            {report.status.replace("_", " ")}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
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
