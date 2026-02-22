const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Report",
            required: true,
        },
        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        teamLeadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        cleanupImage: {
            type: String,
        },
        cleanupGps: {
            lat: {
                type: Number,
            },
            lng: {
                type: Number,
            },
        },
        aiValidation: {
            isClean: {
                type: Boolean,
            },
            reasoning: {
                type: String,
            },
            confidence: {
                type: Number,
            }
        },
        status: {
            type: String,
            enum: ["assigned", "in_progress", "completed", "rework_required"],
            default: "assigned",
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
