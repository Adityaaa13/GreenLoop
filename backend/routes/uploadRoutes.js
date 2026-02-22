const express = require("express");
const router = express.Router();
const upload = require("../services/uploadService");
const auth = require("../middleware/auth");

// Reusable upload route that returns the secure_url
// POST /api/upload
router.post("/", auth, upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file provided" });
        }

        // req.file.path contains the secure_url from Cloudinary
        res.status(200).json({
            secure_url: req.file.path,
            public_id: req.file.filename,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
