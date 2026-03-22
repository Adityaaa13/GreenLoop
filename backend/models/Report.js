const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        citizenId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        gps: {
            lat: {
                type: Number,
                required: true,
            },
            lng: {
                type: Number,
                required: true,
            },
        },
        description: {
            type: String,
            default: "",
        },
        aiValidation: {
            isValid: {
                type: Boolean,
                default: false,
            },
            reasoning: {
                type: String,
                default: "",
            },
            confidence: {
                type: Number,
                default: 0,
            }
        },
        status: {
            type: String,
            enum: ["pending_validation", "verified_dump", "rejected", "cleanup_assigned", "cleaned"],
            default: "pending_validation",
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
