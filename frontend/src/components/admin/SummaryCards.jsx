import React from "react";
import { ClipboardList, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

const SummaryCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4`}>
        <div className={`p-4 rounded-full ${colorClass}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);

const SummaryCards = ({ data }) => {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard
                title="Total Reports"
                value={data.totalDumps || 0}
                icon={ClipboardList}
                colorClass="bg-blue-100 text-blue-600"
            />
            <SummaryCard
                title="Verified Dumps"
                value={data.verifiedDumps || 0}
                icon={CheckCircle}
                colorClass="bg-green-100 text-green-600"
            />
            <SummaryCard
                title="Completed Tasks"
                value={data.completedCleanups || 0}
                icon={CheckCircle}
                colorClass="bg-emerald-100 text-emerald-600"
            />
            <SummaryCard
                title="Rework Required"
                value={data.reworkTasks || 0}
                icon={AlertTriangle}
                colorClass="bg-orange-100 text-orange-600"
            />
        </div>
    );
};

export default SummaryCards;
