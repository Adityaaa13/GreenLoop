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

        res.status(200).json({
            totalDumps,
            verifiedDumps,
            rejectedDumps,
            completedCleanups,
            reworkTasks,
            dumpStatusBreakdown,
            monthlyDumpTrend,
            monthlyCleanupTrend
        });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/dashboard/team-lead
exports.getTeamLeadDashboard = async (req, res) => {
    try {
        const teamLeadId = req.user.id;

        // Overall stats for tasks assigned by this team lead
        const assignedTasks = await Task.countDocuments({ teamLeadId, status: "assigned" });
        const completedTasks = await Task.countDocuments({ teamLeadId, status: "completed" });
        const reworkTasks = await Task.countDocuments({ teamLeadId, status: "rework_required" });

        // Worker Performance Aggregation
        const workerPerformance = await Task.aggregate([
            { $match: { teamLeadId: new require("mongoose").Types.ObjectId(teamLeadId) } },
            {
                $group: {
                    _id: "$workerId",
                    totalAssigned: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                    rework: { $sum: { $cond: [{ $eq: ["$status", "rework_required"] }, 1, 0] } }
                }
            },
            // Lookup user details to get worker name
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "workerInfo"
                }
            },
            { $unwind: "$workerInfo" },
            {
                $project: {
                    _id: 1,
                    workerName: "$workerInfo.name",
                    totalAssigned: 1,
                    completed: 1,
                    rework: 1
                }
            },
            { $sort: { completed: -1 } }
        ]);

        res.status(200).json({
            assignedTasks,
            completedTasks,
            reworkTasks,
            workerPerformance
        });
    } catch (error) {
        console.error("Team Lead Dashboard Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/dashboard/worker
exports.getWorkerDashboard = async (req, res) => {
    try {
        const workerId = req.user.id;

        const totalAssigned = await Task.countDocuments({ workerId });
        const completed = await Task.countDocuments({ workerId, status: "completed" });
        const rework = await Task.countDocuments({ workerId, status: "rework_required" });

        // Calculate simple completion rate
        let completionRate = 0;
        if (totalAssigned > 0) {
            completionRate = Math.round((completed / totalAssigned) * 100);
        }

        res.status(200).json({
            totalAssigned,
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

        // Retrieve the most recent submissions up to 5
        const recentReports = await Report.find({ citizenId })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            totalSubmitted,
            verified,
            rejected,
            pending,
            recentReports
        });
    } catch (error) {
        console.error("Citizen Dashboard Error:", error);
        res.status(500).json({ message: error.message });
    }
};
