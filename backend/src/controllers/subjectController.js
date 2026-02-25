const db = require("../config/db");

/*
  Subject Controller
  ------------------
  Handles:
  - Create subject
  - Get subjects by course + semester
  - Update subject
  - Delete subject
*/


// ============================
// Create Subject
// ============================
exports.createSubject = async (req, res) => {
    const {
        subjectcode,
        subjectname,
        courcecode,
        semoryear,
        subjecttype,
        theorymarks,
        practicalmarks
    } = req.body;

    if (
        !subjectcode ||
        !subjectname ||
        !courcecode ||
        !semoryear ||
        !subjecttype ||
        theorymarks === undefined ||
        practicalmarks === undefined
    ) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        await db.query(
            `INSERT INTO subject 
            (subjectcode, subjectname, courcecode, semoryear, subjecttype, theorymarks, practicalmarks)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                subjectcode.trim().toUpperCase(),
                subjectname.trim(),
                courcecode,
                semoryear,
                subjecttype,
                theorymarks,
                practicalmarks
            ]
        );

        res.status(201).json({ message: "Subject created successfully" });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Subject code already exists"
            });
        }

        console.error(error);
        res.status(500).json({ message: "Error creating subject" });
    }
};


// ============================
// Get Subjects by Course + Semester
// ============================
exports.getSubjects = async (req, res) => {
    const { course_code, sem } = req.query;

    if (!course_code || !sem) {
        return res.status(400).json({
            message: "Course code and semester are required"
        });
    }

    try {
        const [subjects] = await db.query(
            `SELECT 
                subjectcode,
                subjectname,
                semoryear,
                subjecttype,
                theorymarks,
                practicalmarks
             FROM subject
             WHERE courcecode = ? AND semoryear = ?
             ORDER BY subjectcode ASC`,
            [course_code, sem]
        );

        res.json(subjects);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching subjects" });
    }
};


// ============================
// Update Subject
// ============================
exports.updateSubject = async (req, res) => {
    const { subjectcode } = req.params;

    const {
        subjectname,
        subjecttype,
        theorymarks,
        practicalmarks
    } = req.body;

    if (
        !subjectname ||
        !subjecttype ||
        theorymarks === undefined ||
        practicalmarks === undefined
    ) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const [result] = await db.query(
            `UPDATE subject 
             SET subjectname = ?, subjecttype = ?, theorymarks = ?, practicalmarks = ?
             WHERE subjectcode = ?`,
            [
                subjectname.trim(),
                subjecttype,
                theorymarks,
                practicalmarks,
                subjectcode
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Subject not found" });
        }

        res.json({ message: "Subject updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating subject" });
    }
};


// ============================
// Delete Subject
// ============================
exports.deleteSubject = async (req, res) => {
    const { subjectcode } = req.params;

    try {
        const [result] = await db.query(
            "DELETE FROM subject WHERE subjectcode = ?",
            [subjectcode]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Subject not found" });
        }

        res.json({ message: "Subject deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting subject" });
    }
};