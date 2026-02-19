const db = require("../config/db");

/*
  Course Controller
  -----------------
  Handles:
  - Create course
  - Get all courses
  - Update course
  - Delete course
*/

// Create Course
exports.createCourse = async (req, res) => {
    const { course_code, course_name, total_semesters } = req.body;

    try {
        await db.query(
            "INSERT INTO courses (course_code, course_name, total_semesters) VALUES (?, ?, ?)",
            [course_code, course_name, total_semesters]
        );

        res.status(201).json({ message: "Course created successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating course" });
    }
};

// Get All Courses
exports.getCourses = async (req, res) => {
    try {
        const [courses] = await db.query("SELECT * FROM courses ORDER BY id DESC");
        res.json(courses);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching courses" });
    }
};

// Update Course
exports.updateCourse = async (req, res) => {
    const { id } = req.params;
    const { course_code, course_name, total_semesters } = req.body;

    try {
        const [result] = await db.query(
            "UPDATE courses SET course_code = ?, course_name = ?, total_semesters = ? WHERE id = ?",
            [course_code, course_name, total_semesters, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ message: "Course updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating course" });
    }
};

// Delete Course
exports.deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query(
            "DELETE FROM courses WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ message: "Course deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting course" });
    }
};
