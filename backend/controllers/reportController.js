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
        const imageUrl = req.file.path;

        // 3. Run AI validation SYNCHRONOUSLY so the response includes the result
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
