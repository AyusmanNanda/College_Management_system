const db = require("../config/db");

exports.getDashboardStats = async (req, res) => {
    try {
        const courseResult = await db.query(
            "SELECT COUNT(*) AS total_courses FROM courses"
        );

        const facultyResult = await db.query(
            "SELECT COUNT(*) AS total_faculty FROM faculties"
        );

        const studentResult = await db.query(
            "SELECT COUNT(*) AS total_students FROM students"
        );

        const courseCount = courseResult.rows[0];
        const facultyCount = facultyResult.rows[0];
        const studentCount = studentResult.rows[0];

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