const db = require("../config/db");

/*
  Course Controller
  -----------------
  Handles:
  - Create course
  - Get all courses (with subject & student counts)
  - Update course
  - Delete course
*/


// ============================
// Create Course
// ============================
exports.createCourse = async (req, res) => {
    const { course_code, course_name, sem_or_year, total_semesters } = req.body;

    if (!course_code || !course_name || !sem_or_year || !total_semesters) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        await db.query(
            "INSERT INTO courses (course_code, course_name, sem_or_year, total_semesters) VALUES ($1, $2, $3, $4)",
            [
                course_code.trim().toUpperCase(),
                course_name.trim(),
                sem_or_year,
                total_semesters
            ]
        );

        res.status(201).json({ message: "Course created successfully" });

    } catch (error) {

        if (error.code === "23505") {
            return res.status(400).json({
                message: "Course code or course name already exists"
            });
        }

        console.error(error);
        res.status(500).json({ message: "Error creating course" });
    }
};


// ============================
// Get All Courses (WITH COUNTS)
// ============================
exports.getCourses = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                c.*,
                (SELECT COUNT(*) FROM subject s WHERE s.courcecode = c.course_code) AS subject_count,
                (SELECT COUNT(*) FROM students st WHERE st.Courcecode = c.course_code) AS student_count
            FROM courses c
            ORDER BY c.id DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching courses" });
    }
};


// ============================
// Update Course
// ============================
exports.updateCourse = async (req, res) => {
    const { id } = req.params;
    const { course_code, course_name, sem_or_year, total_semesters } = req.body;

    if (!course_code || !course_name || !sem_or_year || !total_semesters) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const result = await db.query(
            "UPDATE courses SET course_code = $1, course_name = $2, sem_or_year = $3, total_semesters = $4 WHERE id = $5",
            [
                course_code.trim().toUpperCase(),
                course_name.trim(),
                sem_or_year,
                total_semesters,
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ message: "Course updated successfully" });

    } catch (error) {

        if (error.code === "23505") {
            return res.status(400).json({
                message: "Course code or course name already exists"
            });
        }

        console.error(error);
        res.status(500).json({ message: "Error updating course" });
    }
};


// ============================
// Delete Course
// ============================
exports.deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            "DELETE FROM courses WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ message: "Course deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting course" });
    }
};