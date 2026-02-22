const db = require("../config/db");

/*
  Assign Controller
  -----------------
  Handles:
  - Get faculties by course + semester
  - Assign subject to faculty
*/


// ============================
// Get Faculties By Course + Semester
// ============================
exports.getFaculties = async (req, res) => {
    const { course_code, sem } = req.query;

    if (!course_code || !sem) {
        return res.status(400).json({
            message: "Course code and semester are required"
        });
    }

    try {
        const [faculties] = await db.query(
            `SELECT sr_no, facultyname, emailid, subject
             FROM faculties
             WHERE courcecode = ? AND semoryear = ?
             ORDER BY facultyname ASC`,
            [course_code, sem]
        );

        res.json(faculties);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching faculties" });
    }
};


// ============================
// Assign Subject To Faculty
// ============================
exports.assignSubject = async (req, res) => {
    const { facultyId } = req.params;
    const { subjectcode, courcecode, semoryear } = req.body;

    if (!subjectcode || !courcecode || !semoryear) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        const [result] = await db.query(
            `UPDATE faculties
             SET subject = ?, courcecode = ?, semoryear = ?
             WHERE sr_no = ?`,
            [subjectcode, courcecode, semoryear, facultyId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        res.json({ message: "Subject assigned successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error assigning subject" });
    }
};