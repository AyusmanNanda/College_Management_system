const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const subjectsRoutes = require("./routes/subjectsRoutes");
const assignRoutes = require("./routes/assignRoutes");
const facultyRoutes = require("./routes/facultyRoutes");

const app = express();

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true); // allow server-to-server or curl

            if (
                origin.includes("vercel.app") ||
                origin.includes("localhost")
            ) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/assign", assignRoutes);
app.use("/api/faculty", facultyRoutes);

module.exports = app;
