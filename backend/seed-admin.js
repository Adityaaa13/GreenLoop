const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected for seeding..."))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

const seedAdmin = async () => {
    try {
        const adminData = {
            name: "Super Admin",
            email: "admin@greenloop.com",
            password: "admin123@", // Automatically hashed by User.js pre-save hook
            role: "admin",
        };

        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log(`Admin user with email ${adminData.email} already exists!`);
            process.exit(0);
        }

        const adminUser = await User.create(adminData);

        console.log("====================================");
        console.log("✅ Admin successfully created!");
        console.log("Email: " + adminUser.email);
        console.log("Password: " + adminData.password);
        console.log("====================================");

        process.exit(0);
    } catch (error) {
        console.error("Error creating Admin:", error.message);
        process.exit(1);
    }
};

seedAdmin();
