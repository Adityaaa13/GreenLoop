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

        // 2. Cloudinary handles upload via Multer (in the router)
        // Here we just grab the secure_url provided by multer-storage-cloudinary
        const imageUrl = req.file.path;

        // Create preliminary report (pending_validation)
        let report = await Report.create({
            citizenId: req.user.id,
            imageUrl: imageUrl,
            gps: { lat: Number(lat), lng: Number(lng) },
            description: description || "",
            status: "pending_validation"
        });

        // We can respond early that upload succeeded, and let AI work in background
        // Or we can await AI (usually ~2-5 seconds). To keep it simple, we await the result.

        // 3. Send image URL to AI validation service
        const aiResult = await validateDumpImage(imageUrl);

        // 4 & 5. Save AI result and update status
        report.aiValidation = {
            isValid: aiResult.isValid,
            reasoning: aiResult.reasoning,
            confidence: aiResult.confidence
        };
        report.status = aiResult.isValid ? "verified_dump" : "rejected";

        await report.save();

        res.status(201).json({
            message: "Report processed successfully",
            report
        });
    } catch (error) {
        console.error("Create Report Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports
// Fetch all reports (for Admin monitoring)
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().populate("citizenId", "name email").sort({ createdAt: -1 });
        res.status(200).json({ reports });
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
