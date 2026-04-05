const Report = require("../models/Report");
const { validateDumpImage } = require("../services/aiService");

// POST /api/reports
exports.createReport = async (req, res) => {
    try {
        // 1. Validate inputs early
        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const { lat, lng, description } = req.body;
        if (!lat || !lng) {
            return res.status(400).json({ message: "GPS coordinates (lat, lng) are required" });
        }

        // 2. Cloudinary handles upload via Multer (in the router) // this is clud part 
        const imageUrl = req.file.path;

        // 3. Run AI validation SYNCHRONOUSLY so the response includes the results
        console.log(`[Report] Starting AI validation for image: ${imageUrl}`);
        let aiResult;
        try {
            aiResult = await validateDumpImage(imageUrl);
            console.log(`[Report] AI validation complete:`, aiResult);
        } catch (aiError) {
            console.error("[Report] AI validation threw:", aiError);
            aiResult = {
                isValid: false,
                reasoning: `AI validation error: ${aiError.message}`,
                confidence: 0
            };
        }

        // 4. Create report with AI result already populated
        const report = await Report.create({
            citizenId: req.user.id,
            imageUrl: imageUrl,
            gps: { lat: Number(lat), lng: Number(lng) },
            description: description || "",
            status: aiResult.isValid ? "verified_dump" : "rejected",
            aiValidation: {
                isValid: aiResult.isValid,
                reasoning: aiResult.reasoning,
                confidence: aiResult.confidence
            }
        });

        res.status(201).json({
            message: aiResult.isValid
                ? "Report verified! AI confirmed this is a valid garbage dump."
                : "Report analyzed. AI could not verify this as a valid garbage dump.",
            report
        });

    } catch (error) {
        console.error("Create Report Error:", error);
        res.status(500).json({ message: error.message });
    }
};

const Task = require("../models/Task");

// GET /api/reports
// Fetch all reports (for Admin monitoring) with task assignment info
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().populate("citizenId", "name email").sort({ createdAt: -1 }).lean();

        // Fetch all tasks and index by reportId for fast lookup
        const tasks = await Task.find()
            .populate("workerId", "name email")
            .populate("teamLeadId", "name email")
            .lean();

        const taskByReportId = {};
        tasks.forEach(t => {
            taskByReportId[t.reportId.toString()] = t;
        });

        // Attach task info to each report
        const enrichedReports = reports.map(r => {
            const task = taskByReportId[r._id.toString()];
            return {
                ...r,
                task: task ? {
                    _id: task._id,
                    status: task.status,
                    worker: task.workerId,
                    teamLead: task.teamLeadId,
                    createdAt: task.createdAt,
                    updatedAt: task.updatedAt,
                } : null
            };
        });

        res.status(200).json({ reports: enrichedReports });
    } catch (error) {
        console.error("Fetch Reports Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/my
// Fetch reports for the logged-in citizen
exports.getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ citizenId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ reports });
    } catch (error) {
        console.error("Fetch My Reports Error:", error);
        res.status(500).json({ message: error.message });
    }
};
