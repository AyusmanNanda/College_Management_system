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
const studentRoutes = require("./routes/studentRoutes");

const app = express();

app.use(cors());
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
app.use("/api/student", studentRoutes);

module.exports = app;
