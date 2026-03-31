const Task = require("../models/Task");
const Report = require("../models/Report");
const User = require("../models/User");

// POST /api/tasks/assign
// Only team_lead can assign
exports.assignTask = async (req, res) => {
    try {
        const { reportId, workerId } = req.body;

        if (!reportId || !workerId) {
            return res.status(400).json({ message: "reportId and workerId are required" });
        }

        // 1. Check if the report exists and is a verified_dump
        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        if (report.status !== "verified_dump") {
            return res.status(400).json({
                message: "Only 'verified_dump' reports can be assigned"
            });
        }

        // 2. Check if the worker exists and is actually a worker
        const worker = await User.findById(workerId);
        if (!worker || worker.role !== "worker") {
            return res.status(400).json({ message: "Valid worker ID is required" });
        }

        // 3. Create the Task
        const task = await Task.create({
            reportId: report._id,
            workerId: worker._id,
            teamLeadId: req.user.id, // Current authenticated team_lead
            status: "assigned"
        });

        // 4. Update the report status so it can't be assigned again
        report.status = "cleanup_assigned";
        await report.save();

        res.status(201).json({
            message: "Task assigned successfully",
            task
        });

    } catch (error) {
        console.error("Assign Task Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Helper function to calculate distance in meters between two coordinates using Haversine formula
const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of the earth in m
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const { validateCleanupImage } = require("../services/aiService");



// POST /api/tasks/upload-cleanup
// Only 'worker' can upload
exports.uploadCleanup = async (req, res) => {
    try {
        const { taskId, lat, lng } = req.body;

        if (!taskId || !req.file || !lat || !lng) {
            return res.status(400).json({
                message: "taskId, image file, and GPS coordinates (lat, lng) are required"
            });
        }

        // 1. Fetch task and populate corresponding report to get original GPS
        const task = await Task.findById(taskId).populate("reportId");
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Ensure the task actually belongs to this worker
        if (task.workerId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized: You are not assigned to this task" });
        }

        // Ensure task is not already completed
        if (task.status === "completed") {
            return res.status(400).json({ message: "This task is already completed" });
        }

        const cleanupImageUrl = req.file.path;

        // 2. Compare GPS coordinates
        const originalGps = task.reportId.gps;
        const distanceMismatch = getDistanceFromLatLonInMeters(
            originalGps.lat, originalGps.lng,
            Number(lat), Number(lng)
        );

        // If they are more than ~150 meters away from the dump, reject it
        if (distanceMismatch > 150) {
            task.cleanupImage = cleanupImageUrl;
            task.cleanupGps = { lat: Number(lat), lng: Number(lng) };
            task.status = "rework_required";
            task.aiValidation = {
                isClean: false,
                reasoning: `Cleanup GPS is ${Math.round(distanceMismatch)}m away from original dump. Please be at the exact location.`,
                confidence: 1
            };
            await task.save();
            return res.status(400).json({
                message: "GPS validation failed. You are too far from the original dump.",
                task
            });
        }

        // 3. Call AI Validation if GPS passes
        let aiResult;
        try {
            aiResult = await validateCleanupImage(cleanupImageUrl);
        } catch (aiError) {
            console.error("[Cleanup] AI validation threw:", aiError);
            aiResult = {
                isClean: false,
                reasoning: `AI Service Error: Could not determine cleanliness. Please try uploading again or contact Team Lead. (${aiError.message})`,
                confidence: 0
            };
        }

        // 4. Save results and update status
        task.cleanupImage = cleanupImageUrl;
        task.cleanupGps = { lat: Number(lat), lng: Number(lng) };
        task.aiValidation = {
            isClean: aiResult.isClean,
            reasoning: aiResult.reasoning,
            confidence: aiResult.confidence
        };

        // 5. If valid -> completed, else -> rework_required
        task.status = aiResult.isClean ? "completed" : "rework_required";
        await task.save();

        // 6. Update the Report status to reflect the cleanup outcome
        const report = task.reportId;
        if (aiResult.isClean) {
            report.status = "cleaned";
            await report.save();
        }

        res.status(200).json({
            message: aiResult.isClean ? "Cleanup validated and completed!" : "Cleanup rejected. Rework required.",
            task
        });

    } catch (error) {
        console.error("Upload Cleanup Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/tasks
// Fetch all tasks for Admin monitoring
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate("reportId")
            .populate("workerId", "name email")
            .populate("teamLeadId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ tasks });
    } catch (error) {
        console.error("Fetch Tasks Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/tasks/my
// Worker fetches their own tasks
exports.getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ workerId: req.user.id })
            .populate("reportId", "imageUrl gps description status aiValidation")
            .populate("teamLeadId", "name email")
            .sort({ updatedAt: -1 });

        res.status(200).json({ tasks });
    } catch (error) {
        console.error("Fetch My Tasks Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/tasks/reassign/:id
// Only team_lead can reassign
exports.reassignTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { newWorkerId } = req.body;

        if (!newWorkerId) {
            return res.status(400).json({ message: "newWorkerId is required" });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Only allow reassigning if the current user is the team lead who manages it
        if (task.teamLeadId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Unauthorized: You can only reassign your own tasks" });
        }

        // Validate the new worker
        const worker = await User.findById(newWorkerId);
        if (!worker || worker.role !== "worker") {
            return res.status(400).json({ message: "Valid worker ID is required" });
        }

        // Reassign and reset the task
        task.workerId = worker._id;
        task.status = "assigned";
        task.createdAt = new Date(); // Reset the assignment date for the new worker
        
        task.cleanupImage = undefined;
        task.cleanupGps = undefined;
        task.aiValidation = undefined;

        await task.save();

        res.status(200).json({
            message: "Task reassigned successfully",
            task
        });

    } catch (error) {
        console.error("Reassign Task Error:", error);
        res.status(500).json({ message: error.message });
    }
};
