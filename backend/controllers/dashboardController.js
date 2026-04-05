const mongoose = require("mongoose");
const Report = require("../models/Report");
const Task = require("../models/Task");
const User = require("../models/User");

// GET /api/dashboard/admin
exports.getAdminDashboard = async (req, res) => {
    try {
        // 1. Core overall stats
        const totalDumps = await Report.countDocuments();
        const verifiedDumps = await Report.countDocuments({ status: "verified_dump" });
        const rejectedDumps = await Report.countDocuments({ status: "rejected" });

        const completedCleanups = await Task.countDocuments({ status: "completed" });
        const reworkTasks = await Task.countDocuments({ status: "rework_required" });
        const cleanupAssigned = await Report.countDocuments({ status: "cleanup_assigned" });

        // 2. Dump Status Breakdown (for pie chart)
        const dumpStatusBreakdown = await Report.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // 3. Monthly Dump Trend (grouped by month string "YYYY-MM")
        const monthlyDumpTrend = await Report.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 4. Monthly Cleanup Trend (grouped by month string "YYYY-MM")
        const monthlyCleanupTrend = await Task.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 5. Live Activity Feed (top 10 latest events)
        const recentReports = await Report.find().populate("citizenId", "name").sort({ createdAt: -1 }).limit(10).lean();
        const recentTasks = await Task.find().populate("workerId", "name").populate("teamLeadId", "name").sort({ updatedAt: -1 }).limit(10).lean();

        let activityFeed = [];
        
        recentReports.forEach(r => {
            activityFeed.push({
                _id: r._id,
                type: 'report_created',
                user: r.citizenId?.name || "A citizen",
                action: "submitted a new dump report",
                timestamp: r.createdAt
            });
        });

        recentTasks.forEach(t => {
            if (t.status === 'completed') {
                activityFeed.push({
                    _id: t._id + '_completed',
                    type: 'task_completed',
                    user: t.workerId?.name || "A worker",
                    action: "completed a cleanup task",
                    timestamp: t.updatedAt
                });
            } else if (t.status === 'assigned') {
                activityFeed.push({
                    _id: t._id + '_assigned',
                    type: 'task_assigned',
                    user: t.teamLeadId?.name || "A team lead",
                    action: `assigned a task to ${t.workerId?.name || "a worker"}`,
                    timestamp: t.createdAt
                });
            }
        });

        // Sort unified array descending and take top 10
        activityFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        activityFeed = activityFeed.slice(0, 10);

        // 6. Overdue Tasks (Assigned but not completed after 48 hours)
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const overdueActionItems = await Task.find({
            status: "assigned",
            createdAt: { $lt: fortyEightHoursAgo }
        }).populate("workerId", "name email").populate("teamLeadId", "name email").populate("reportId", "imageUrl gps").sort({ createdAt: 1 }).lean();

        res.status(200).json({
            totalDumps,
            verifiedDumps,
            rejectedDumps,
            cleanupAssigned,
            completedCleanups,
            reworkTasks,
            dumpStatusBreakdown,
            monthlyDumpTrend,
            monthlyCleanupTrend,
            activityFeed,
            overdueActionItems
        });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/dashboard/team-lead/ team-lead's dashboard
exports.getTeamLeadDashboard = async (req, res) => {
    try {
        const teamLeadId = req.user.id;

        // Overall stats for tasks assigned by this team lead
        const assignedTasks = await Task.countDocuments({ teamLeadId, status: "assigned" });
        const completedTasks = await Task.countDocuments({ teamLeadId, status: "completed" });
        const reworkTasks = await Task.countDocuments({ teamLeadId, status: "rework_required" });

        // Worker Performance Aggregation
        // Worker Performance Aggregation (including idle workers)
        const teamWorkers = await User.find({ role: "worker", teamLeadId }).select("name email").lean();
        
        const workerStats = await Task.aggregate([
            { $match: { teamLeadId: new mongoose.Types.ObjectId(teamLeadId) } },
            {
                $group: {
                    _id: "$workerId",
                    totalAssigned: { $sum: 1 },
                    active: { $sum: { $cond: [{ $eq: ["$status", "assigned"] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                    rework: { $sum: { $cond: [{ $eq: ["$status", "rework_required"] }, 1, 0] } }
                }
            }
        ]);

        const workerPerformance = teamWorkers.map(w => {
            const stats = workerStats.find(s => s._id && s._id.toString() === w._id.toString()) || {
                totalAssigned: 0, active: 0, completed: 0, rework: 0
            };
            return {
                _id: { _id: w._id, name: w.name, email: w.email },
                totalAssigned: stats.totalAssigned,
                active: stats.active,
                completed: stats.completed,
                rework: stats.rework
            };
        });

        // Sort by active tasks first so they see who is currently working
        workerPerformance.sort((a, b) => b.active - a.active);

        // Fetch the last 20 tasks for the live task tracker
        const recentTasks = await Task.find({ teamLeadId })
            .populate("workerId", "name email")
            .populate("reportId", "imageUrl gps aiConfidence status")
            .sort({ updatedAt: -1 })
            .limit(20)
            .lean();

        res.status(200).json({
            assignedTasks,
            completedTasks,
            reworkTasks,
            workerPerformance,
            recentTasks
        });
    } catch (error) {
        console.error("Team Lead Dashboard Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/dashboard/team-lead/workers
exports.getTeamWorkers = async (req, res) => {
    try {
        const teamLeadId = req.user.id;
        // Fetch only workers strictly assigned to this Team Lead
        const workers = await User.find({ role: "worker", teamLeadId })
            .select("name email _id")
            .lean();
            
        res.status(200).json(workers);
    } catch (error) {
        console.error("Team Lead Workers Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/dashboard/worker
exports.getWorkerDashboard = async (req, res) => {
    try {
        const workerId = req.user.id;

        const totalAssigned = await Task.countDocuments({ workerId });
        const active = await Task.countDocuments({ workerId, status: { $in: ["assigned", "in_progress"] } });
        const completed = await Task.countDocuments({ workerId, status: "completed" });
        const rework = await Task.countDocuments({ workerId, status: "rework_required" });

        // Calculate simple completion rate
        let completionRate = 0;
        if (totalAssigned > 0) {
            completionRate = Math.round((completed / totalAssigned) * 100);
        }

        res.status(200).json({
            totalAssigned,
            active,
            completed,
            rework,
            completionRate
        });
    } catch (error) {
        console.error("Worker Dashboard Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/dashboard/citizen
exports.getCitizenDashboard = async (req, res) => {
    try {
        const citizenId = req.user.id;

        const totalSubmitted = await Report.countDocuments({ citizenId });
        const verified = await Report.countDocuments({ citizenId, status: "verified_dump" });
        const rejected = await Report.countDocuments({ citizenId, status: "rejected" });
        const pending = await Report.countDocuments({ citizenId, status: "pending_validation" });
        const cleanupAssigned = await Report.countDocuments({ citizenId, status: "cleanup_assigned" });
        const cleaned = await Report.countDocuments({ citizenId, status: "cleaned" });

        // Retrieve the most recent submissions up to 5
        const recentReports = await Report.find({ citizenId })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            totalSubmitted,
            verified,
            rejected,
            pending,
            cleanupAssigned,
            cleaned,
            recentReports
        });
    } catch (error) {
        console.error("Citizen Dashboard Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/dashboard/community-stats
exports.getCommunityStats = async (req, res) => {
    try {
        const totalVerifiedDumps = await Report.countDocuments({ status: { $in: ["verified_dump", "cleanup_assigned", "cleaned"] } });
        const totalCleanups = await Report.countDocuments({ status: "cleaned" });
        const activeCitizens = await Report.distinct("citizenId");
        const totalReports = await Report.countDocuments();

        // Top contributors: citizens ranked by verified reports
        const topContributors = await Report.aggregate([
            {
                $group: {
                    _id: "$citizenId",
                    totalReports: { $sum: 1 },
                    verified: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", ["verified_dump", "cleanup_assigned", "cleaned"]] },
                                1, 0
                            ]
                        }
                    }
                }
            },
            { $sort: { verified: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: "$user.name",
                    totalReports: 1,
                    verified: 1,
                    accuracy: {
                        $cond: [
                            { $gt: ["$totalReports", 0] },
                            { $round: [{ $multiply: [{ $divide: ["$verified", "$totalReports"] }, 100] }, 0] },
                            0
                        ]
                    }
                }
            }
        ]);

        res.status(200).json({
            totalVerifiedDumps,
            activeCitizens: activeCitizens.length,
            totalCleanups,
            totalReports,
            topContributors
        });
    } catch (error) {
        console.error("Community Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};
