const db = require("../config/db");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const XLSX = require("xlsx");

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


const getTodayDate = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const getUserRole = (req) => {
    return String(
        req.user?.role ||
        req.user?.usertype ||
        req.user?.userType ||
        req.user?.type ||
        ""
    ).toLowerCase();
};

/* ============================================================
   GET STUDENTS FOR ATTENDANCE
============================================================ */

exports.getStudents = async (req, res) => {
    const { course, sem } = req.query;

    if (!course || !sem) {
        return res.status(400).json({ message: "Course and semester required" });
    }

    try {
        const [rows] = await db.query(
            `SELECT sr_no, rollnumber, firstname, lastname
             FROM students
             WHERE Courcecode = ? AND semoryear = ?
             ORDER BY rollnumber`,
            [course, sem]
        );

        const formatted = rows.map(student => ({
            student_id: student.sr_no,
            rollnumber: student.rollnumber,
            firstname: student.firstname,
            lastname: student.lastname,
            profilepic: getStudentImage(student.rollnumber)
        }));

        res.json(formatted);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch students" });
    }
};

/* ============================================================
   GET ATTENDANCE BY DATE
============================================================ */

exports.getAttendanceByDate = async (req, res) => {
    let { subjectcode, date, courcecode, semoryear } = req.query;

    if (!subjectcode || !date || !courcecode || !semoryear) {
        return res.status(400).json({ message: "Missing required filters" });
    }

    date = String(date).slice(0, 10);   // FIXED

    try {
        const [rows] = await db.query(
            `
                SELECT
                    s.sr_no AS student_id,
                    IFNULL(a.present, 0) AS present
                FROM students s
                         LEFT JOIN attendance a
                                   ON s.sr_no = a.student_id
                                       AND a.subjectcode = ?
                                       AND a.attendance_date = ?
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

/* ============================================================
   SAVE / UPDATE ATTENDANCE
============================================================ */

exports.saveAttendance = async (req, res) => {
    let { subjectcode, date, courcecode, semoryear, records } = req.body;

    if (!subjectcode || !date || !courcecode || !semoryear || !Array.isArray(records)) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    date = String(date).slice(0, 10);   // FIXED


    const todayDate = getTodayDate();
    const userRole = getUserRole(req);

    if (userRole === "faculty" && date !== todayDate) {
    return res.status(403).json({
        message: "Faculty can edit attendance only for today's date"
    });
   }

    try {
        const values = records.map(r => [
            r.student_id,
            subjectcode,
            date,
            r.present,
            courcecode,
            Number(semoryear)
        ]);

        await db.query(
            `
                INSERT INTO attendance
                (student_id, subjectcode, attendance_date, present, courcecode, semoryear)
                VALUES ?
                    ON DUPLICATE KEY UPDATE present = VALUES(present)
            `,
            [values]
        );

        res.json({ message: "Attendance saved successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to save attendance" });
    }
};

/* ============================================================
   GET ATTENDANCE REPORT
============================================================ */

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
                    COUNT(a.attendance_date) AS total_classes,
                    SUM(a.present) AS present_count,
                    ROUND(
                            IFNULL((SUM(a.present) / NULLIF(COUNT(a.attendance_date), 0)) * 100, 0),
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

/* ============================================================
   GET EXISTING ATTENDANCE DATES
============================================================ */

exports.getAttendanceDates = async (req, res) => {
    const { subjectcode, courcecode, semoryear } = req.query;

    if (!subjectcode || !courcecode || !semoryear) {
        return res.status(400).json({ message: "Missing filters" });
    }

    try {
        const [rows] = await db.query(
            `
                SELECT DISTINCT DATE_FORMAT(attendance_date, '%Y-%m-%d') AS date
                FROM attendance
                WHERE subjectcode = ?
                  AND courcecode = ?
                  AND semoryear = ?
                ORDER BY date DESC
            `,
            [subjectcode, courcecode, semoryear]
        );

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch dates" });
    }
};

/* ============================================================
   DELETE ATTENDANCE
============================================================ */

exports.deleteAttendance = async (req, res) => {
    let { subjectcode, date, courcecode, semoryear } = req.body;

    if (!subjectcode || !date || !courcecode || !semoryear) {
        return res.status(400).json({ message: "Missing required filters" });
    }

    date = String(date).slice(0, 10);   // FIXED

    try {
        await db.query(
            `
                DELETE FROM attendance
                WHERE subjectcode = ?
                  AND attendance_date = ?
                  AND courcecode = ?
                  AND semoryear = ?
            `,
            [subjectcode, date, courcecode, semoryear]
        );

        res.json({ message: "Attendance deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete attendance" });
    }
};



/* ============================================================
   DOWNLOAD ATTENDANCE TEMPLATE
============================================================ */

exports.downloadAttendanceTemplate = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Attendance Template");

        worksheet.columns = [
            { header: "rollnumber", key: "rollnumber", width: 18 },
            { header: "present", key: "present", width: 12 },
            { header: "absent", key: "absent", width: 12 }
        ];

        // one demo row only
        worksheet.addRow({
            rollnumber: 23011006,
            present: 1,
            absent: 0
        });

        worksheet.getRow(1).font = { bold: true };

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="attendance_template.xlsx"'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("Download attendance template error:", err);
        res.status(500).json({ message: "Failed to download template" });
    }
};

/* ============================================================
   IMPORT ATTENDANCE FROM EXCEL
============================================================ */

exports.importAttendance = async (req, res) => {
    let { subjectcode, date, courcecode, semoryear } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: "Excel file is required" });
    }

    if (!subjectcode || !date || !courcecode || !semoryear) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    date = String(date).slice(0, 10);

    const todayDate = getTodayDate();
    const userRole = getUserRole(req);

    if (userRole === "faculty" && date !== todayDate) {
        return res.status(403).json({
            message: "Faculty can import attendance only for today's date"
        });
    }

    try {
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rows.length) {
            return res.status(400).json({ message: "Excel file is empty" });
        }

        const [students] = await db.query(
            `
                SELECT sr_no, rollnumber
                FROM students
                WHERE Courcecode = ? AND semoryear = ?
            `,
            [courcecode, semoryear]
        );

        const rollMap = new Map(
            students.map((student) => [String(student.rollnumber).trim(), student.sr_no])
        );

        const values = [];
        const errors = [];
        let invalidRows = 0;

        rows.forEach((row, index) => {
            const excelRowNumber = index + 2;

            const rollnumber = String(row.rollnumber || "").trim();
            const presentValue = String(row.present ?? "").trim();
            const absentValue = String(row.absent ?? "").trim();

            if (!rollnumber) {
                invalidRows++;
                errors.push({
                    row: excelRowNumber,
                    reason: "rollnumber is required"
                });
                return;
            }

            if (!rollMap.has(rollnumber)) {
                invalidRows++;
                errors.push({
                    row: excelRowNumber,
                    reason: `Student not found for rollnumber ${rollnumber}`
                });
                return;
            }

            const normalizedPresent = Number(presentValue);
            const normalizedAbsent = Number(absentValue);

            const presentOk = normalizedPresent === 0 || normalizedPresent === 1;
            const absentOk = normalizedAbsent === 0 || normalizedAbsent === 1;

            if (!presentOk || !absentOk) {
                invalidRows++;
                errors.push({
                    row: excelRowNumber,
                    reason: "present and absent must be 0 or 1"
                });
                return;
            }

            if (normalizedPresent === normalizedAbsent) {
                invalidRows++;
                errors.push({
                    row: excelRowNumber,
                    reason: "Exactly one of present or absent must be 1"
                });
                return;
            }

            const student_id = rollMap.get(rollnumber);

            values.push([
                student_id,
                subjectcode,
                date,
                normalizedPresent,
                courcecode,
                Number(semoryear)
            ]);
        });

        if (!values.length) {
            return res.status(400).json({
                message: "No valid rows found in file",
                totalRows: rows.length,
                inserted: 0,
                invalidRows,
                errors
            });
        }

        await db.query(
            `
                INSERT INTO attendance
                (student_id, subjectcode, attendance_date, present, courcecode, semoryear)
                VALUES ?
                ON DUPLICATE KEY UPDATE present = VALUES(present)
            `,
            [values]
        );

        return res.json({
            message: "Attendance imported successfully",
            totalRows: rows.length,
            inserted: values.length,
            invalidRows,
            errors
        });
    } catch (err) {
        console.error("Import attendance error:", err);
        res.status(500).json({ message: "Failed to import attendance" });
    }
};