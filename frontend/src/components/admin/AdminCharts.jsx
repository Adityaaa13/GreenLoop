import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const STATUS_COLORS = {
    "pending_validation": "#F59E0B",  // amber/yellow
    "verified_dump": "#3B82F6",       // blue
    "rejected": "#EF4444",            // red
    "cleanup_assigned": "#8B5CF6",    // purple
    "cleaned": "#10B981"              // green
};

const DEFAULT_COLOR = "#9CA3AF";      // gray

const AdminCharts = ({ monthlyDumpTrend, dumpStatusBreakdown }) => {
    
    // Format pie chart data (ensuring all statuses show up in the legend even if count is 0)
    const pieData = Object.keys(STATUS_COLORS).map(status => {
        const found = dumpStatusBreakdown?.find(item => item._id === status);
        return {
            name: status.replace("_", " ").toUpperCase(),
            value: found ? found.count : 0,
            color: STATUS_COLORS[status]
        };
    });

    // Format bar chart data
    const barData = monthlyDumpTrend || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status Breakdown Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Status Breakdown</h3>
                <div className="h-72">
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
                    )}
                </div>
            </div>

            {/* Monthly Reports Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Validated Dumps</h3>
                <div className="h-72">
                    {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="_id" tick={{ fill: '#6B7280' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: '#6B7280' }} tickLine={false} axisLine={false} />
                                <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Reports" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCharts;
