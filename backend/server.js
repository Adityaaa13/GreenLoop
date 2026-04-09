// Fix DNS resolution for MongoDB Atlas on restricted networks
const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
    // Pre-warm AI service immediately after DB connection
    const { pingAIService } = require("./services/aiService");
    pingAIService();
});

const app = express();

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Health check
app.get("/", (req, res) => {
    res.json({ message: "GreenLoop API is running" });
});

// Pre-warm AI service (called continuously by frontend to prevent cold starts)
const { pingAIService } = require("./services/aiService");
app.get("/api/system/wakeup", (req, res) => {
    pingAIService();
    res.json({ message: "Waking up services" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
