const db = require("../config/db");

/* ================= GET STUDENTS ================= */

exports.getStudents = async (req, res) => {
    const { course, sem } = req.query;

    if (!course || !sem) {
        return res.status(400).json({ message: "Course and semester required" });
    }

    try {
        const [rows] = await db.query(
            `SELECT rollnumber, firstname, lastname
             FROM students
             WHERE Courcecode = ? AND semoryear = ?`,
            [course, sem]
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ================= SAVE ATTENDANCE ================= */

exports.saveAttendance = async (req, res) => {
    const { subjectcode, date, courcecode, semoryear, records } = req.body;

    if (!subjectcode || !date || !records) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const values = records.map(r => [
            subjectcode,
            date,
            r.rollnumber,
            r.present,
            courcecode,
            semoryear
        ]);

        await db.query(
            `INSERT INTO attendance
             (subjectcode, date, rollnumber, present, courcecode, semoryear)
             VALUES ?
             ON DUPLICATE KEY UPDATE present = VALUES(present)`,
            [values]
        );

        res.json({ message: "Attendance saved successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to save attendance" });
    }
};

/* ================= ATTENDANCE REPORT ================= */

exports.getReport = async (req, res) => {
    const { course, sem, subject } = req.query;

    if (!course || !sem || !subject) {
        return res.status(400).json({ message: "Missing filters" });
    }

    try {
        const [rows] = await db.query(
            `
            SELECT 
                s.rollnumber,
                CONCAT(s.firstname, ' ', s.lastname) AS name,
                COUNT(a.date) AS total_classes,
                SUM(a.present) AS present_count,
                ROUND((SUM(a.present) / COUNT(a.date)) * 100, 2) AS percentage
            FROM students s
            LEFT JOIN attendance a
                ON s.rollnumber = a.rollnumber
                AND a.subjectcode = ?
            WHERE s.courcecode = ? AND s.semoryear = ?
            GROUP BY s.rollnumber
            `,
            [subject, course, sem]
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to generate report" });
    }
};