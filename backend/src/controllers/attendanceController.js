const db = require("../config/db");
const path = require("path");
const fs = require("fs");

/* ================= PROFILE PIC HELPER ================= */

const studentUploadDir = path.resolve(__dirname, "../../uploads/students");

const getStudentImage = (rollnumber) => {
    if (!fs.existsSync(studentUploadDir)) return "default.png";

    const files = fs.readdirSync(studentUploadDir);

    const match = files.find(file => {
        const name = path.basename(file, path.extname(file));
        return name.trim().toLowerCase() === String(rollnumber).trim().toLowerCase();
    });

    return match || "default.png";
};

/* ================= GET STUDENTS FOR ATTENDANCE ================= */

exports.getStudents = async (req, res) => {
    const { course, sem } = req.query;

    if (!course || !sem) {
        return res.status(400).json({ message: "Course and semester required" });
    }

    try {
        const [rows] = await db.query(
            `SELECT sr_no, rollnumber, firstname, lastname
             FROM students
             WHERE Courcecode = ? AND semoryear = ?`,
            [course, sem]
        );

        const updated = rows.map(student => ({
            student_id: student.sr_no,
            rollnumber: student.rollnumber,
            firstname: student.firstname,
            lastname: student.lastname,
            profilepic: getStudentImage(student.rollnumber)
        }));

        res.json(updated);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ================= GET ATTENDANCE BY DATE ================= */

exports.getAttendanceByDate = async (req, res) => {
    const { subjectcode, date, courcecode, semoryear } = req.query;

    if (!subjectcode || !date || !courcecode || !semoryear) {
        return res.status(400).json({ message: "Missing required filters" });
    }

    try {
        const [rows] = await db.query(
            `
                SELECT
                    s.sr_no AS student_id,
                    IFNULL(a.present, 1) AS present
                FROM students s
                         LEFT JOIN attendance a
                                   ON s.sr_no = a.student_id
                                       AND a.subjectcode = ?
                                       AND a.date = ?
                                       AND a.courcecode = ?
                                       AND a.semoryear = ?
                WHERE s.Courcecode = ?
                  AND s.semoryear = ?
                ORDER BY s.rollnumber
            `,
            [subjectcode, date, courcecode, semoryear, courcecode, semoryear]
        );

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch attendance" });
    }
};

/* ================= SAVE / UPDATE ATTENDANCE ================= */

exports.saveAttendance = async (req, res) => {
    const { subjectcode, date, courcecode, semoryear, records } = req.body;

    if (!subjectcode || !date || !courcecode || !semoryear || !records) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const values = records.map(r => [
            r.student_id,
            subjectcode,
            date,
            r.present,
            courcecode,
            semoryear
        ]);

        await db.query(
            `INSERT INTO attendance
                 (student_id, subjectcode, date, present, courcecode, semoryear)
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
                    ROUND(
                            IFNULL((SUM(a.present) / NULLIF(COUNT(a.date), 0)) * 100, 0),
                            2
                    ) AS percentage
                FROM students s
                         LEFT JOIN attendance a
                                   ON s.sr_no = a.student_id
                                       AND a.subjectcode = ?
                WHERE s.Courcecode = ?
                  AND s.semoryear = ?
                GROUP BY s.sr_no
                ORDER BY s.rollnumber
            `,
            [subject, course, sem]
        );

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to generate report" });
    }
};

/* ================= GET EXISTING DATES ================= */

exports.getAttendanceDates = async (req, res) => {
    const { subjectcode, courcecode, semoryear } = req.query;

    if (!subjectcode || !courcecode || !semoryear) {
        return res.status(400).json({ message: "Missing filters" });
    }

    try {
        const [rows] = await db.query(
            `SELECT DISTINCT date
             FROM attendance
             WHERE subjectcode = ?
               AND courcecode = ?
               AND semoryear = ?
             ORDER BY date DESC`,
            [subjectcode, courcecode, semoryear]
        );

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch dates" });
    }
};

/* ================= DELETE ATTENDANCE ================= */

exports.deleteAttendance = async (req, res) => {
    const { subjectcode, date, courcecode, semoryear } = req.body;

    if (!subjectcode || !date || !courcecode || !semoryear) {
        return res.status(400).json({ message: "Missing required filters" });
    }

    try {
        await db.query(
            `DELETE FROM attendance
             WHERE subjectcode = ?
               AND date = ?
               AND courcecode = ?
               AND semoryear = ?`,
            [subjectcode, date, courcecode, semoryear]
        );

        res.json({ message: "Attendance deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete attendance" });
    }
};