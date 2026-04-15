const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const subjectsRoutes = require("./routes/subjectsRoutes");
const assignRoutes = require("./routes/assignRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const marksRoutes = require("./routes/marksRoutes");
const studentDashboardRoutes = require("./routes/studentDashboardRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const studentAttendanceRoutes = require("./routes/studentAttendanceRoutes");
const studentMarksheetRoutes = require("./routes/studentMarksheetRoutes");

const app = express();


app.use(
    cors({
        origin: function (origin, callback) {

            // allow requests without origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);

            if (
                origin.includes("vercel.app") ||
                origin.includes("localhost") ||
                origin.startsWith("file://")
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
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/assign", assignRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/student", studentDashboardRoutes);
app.use("/api/student", studentProfileRoutes);
app.use("/api/student", studentAttendanceRoutes);
app.use("/api/student", studentMarksheetRoutes);

module.exports = app;
