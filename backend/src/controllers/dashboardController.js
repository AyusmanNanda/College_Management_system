const db = require("../config/db");

exports.getDashboardStats = async (req, res) => {
    try {
        const [[courseCount]] = await db.query(
            "SELECT COUNT(*) AS total_courses FROM courses"
        );

        const [[facultyCount]] = await db.query(
            "SELECT COUNT(*) AS total_faculty FROM faculties"
        );

        const [[studentCount]] = await db.query(
            "SELECT COUNT(*) AS total_students FROM students"
        );

        res.json({
            total_courses: courseCount.total_courses,
            total_faculty: facultyCount.total_faculty,
            total_students: studentCount.total_students
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching dashboard data" });
    }
};