import React from "react";
import { Activity, Camera, CheckSquare, ClipboardList } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ActivityFeed = ({ feed = [] }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'report_created':
                return <Camera size={16} className="text-blue-600" />;
            case 'task_assigned':
                return <ClipboardList size={16} className="text-orange-600" />;
            case 'task_completed':
                return <CheckSquare size={16} className="text-emerald-600" />;
            default:
                return <Activity size={16} className="text-gray-600" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'report_created': return 'bg-blue-100';
            case 'task_assigned': return 'bg-orange-100';
            case 'task_completed': return 'bg-emerald-100';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden h-[450px] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Activity size={20} className="text-indigo-600" />
                    Live Activity Feed
                </h3>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
                {feed.length > 0 ? (
                    <div className="space-y-6">
                        {feed.map((item, index) => (
                            <div key={item._id || index} className="flex gap-4">
                                {/* Timeline Line/Icon */}
                                <div className="relative flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${getBgColor(item.type)}`}>
                                        {getIcon(item.type)}
                                    </div>
                                    {index !== feed.length - 1 && (
                                        <div className="w-px h-full bg-gray-200 absolute top-8 bottom-[-24px]"></div>
                                    )}
                                </div>
                                
                                {/* Content */}
                                <div className="pb-1">
                                    <p className="text-sm text-gray-800">
                                        <span className="font-semibold text-gray-900">{item.user}</span>{" "}
                                        {item.action}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 italic text-sm">
                        No recent activity recorded yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
