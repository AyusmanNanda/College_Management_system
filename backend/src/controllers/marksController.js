const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const adminUploadDir = path.resolve(__dirname, "../../uploads/admin");

const getAdminLogo = () => {
    if (!fs.existsSync(adminUploadDir)) return "default.png";

    const files = fs.readdirSync(adminUploadDir);

    const match = files.find(file => {
        const name = path.basename(file, path.extname(file));
        return name === "admin";
    });

    return match || "default.png";
};

// ============================
// Get Students For Marks Entry
// ============================

exports.getStudentsForMarks = async (req, res) => {
    try {

        const { course, sem } = req.query;

        const [rows] = await db.query(
            `SELECT rollnumber, firstname, lastname
             FROM students
             WHERE Courcecode = ? AND semoryear = ?
             ORDER BY rollnumber`,
            [course, sem]
        );

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching students" });
    }
};


// ============================
// Save Marks
// ============================

exports.saveMarks = async (req, res) => {

    try {

        const { course, sem, subject, subjectname, marks } = req.body;

        for (let i = 0; i < marks.length; i++) {

            const { rollnumber, theorymarks, practicalmarks } = marks[i];

            await db.query(
                `INSERT INTO marks
                 (courcecode, semoryear, subjectcode, subjectname, rollnumber, theorymarks, practicalmarks)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 theorymarks = VALUES(theorymarks),
                 practicalmarks = VALUES(practicalmarks)`,
                [
                    course,
                    sem,
                    subject,
                    subjectname || null,
                    rollnumber,
                    theorymarks,
                    practicalmarks
                ]
            );

        }

        res.json({ message: "Marks saved successfully" });

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Error saving marks" });

    }

};


// ============================
// Get Marks For Editing
// ============================

exports.getMarksForEdit = async (req, res) => {

    try {

        const { course, sem, subject } = req.query;

        const [rows] = await db.query(
            `SELECT
                 s.rollnumber,
                 s.firstname,
                 s.lastname,
                 m.theorymarks,
                 m.practicalmarks
             FROM students s
             LEFT JOIN marks m
               ON s.rollnumber = m.rollnumber
               AND m.subjectcode = ?
               AND m.courcecode = ?
               AND m.semoryear = ?
             WHERE s.Courcecode = ?
             AND s.semoryear = ?
             ORDER BY s.rollnumber`,
            [subject, course, sem, course, sem]
        );

        res.json(rows);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Error fetching marks" });

    }

};


// ============================
// Update Marks
// ============================

exports.updateMarks = async (req, res) => {

    try {

        const { course, sem, subject, marks } = req.body;

        for (let i = 0; i < marks.length; i++) {

            const { rollnumber, theorymarks, practicalmarks } = marks[i];

            await db.query(
                `UPDATE marks
                 SET theorymarks = ?, practicalmarks = ?
                 WHERE rollnumber = ?
                 AND subjectcode = ?
                 AND courcecode = ?
                 AND semoryear = ?`,
                [
                    theorymarks,
                    practicalmarks,
                    rollnumber,
                    subject,
                    course,
                    sem
                ]
            );

        }

        res.json({ message: "Marks updated successfully" });

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Error updating marks" });

    }

};


// ============================
// Marks Report
// ============================

exports.getMarksReport = async (req, res) => {

    try {

        const { course, sem } = req.query;

        const [rows] = await db.query(
            `SELECT
                 m.rollnumber,
                 CONCAT(s.firstname, ' ', s.lastname) AS name,
                 m.subjectcode,
                 m.theorymarks,
                 m.practicalmarks
             FROM marks m
             JOIN students s
             ON m.rollnumber = s.rollnumber
             WHERE m.courcecode = ?
             AND m.semoryear = ?
             ORDER BY m.rollnumber`,
            [course, sem]
        );

        res.json(rows);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Error fetching report" });

    }

};


// ============================
// Delete Marks (Single Student)
// ============================

exports.deleteMarks = async (req, res) => {

    try {

        const { course, sem, subject, rollnumber } = req.body;

        await db.query(
            `DELETE FROM marks
             WHERE courcecode = ?
             AND semoryear = ?
             AND subjectcode = ?
             AND rollnumber = ?`,
            [course, sem, subject, rollnumber]
        );

        res.json({ message: "Marks deleted successfully" });

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Delete failed" });

    }

};


// ============================
// Delete All Marks For Subject
// ============================

exports.deleteSubjectMarks = async (req, res) => {

    try {

        const { course, sem, subject } = req.body;

        await db.query(
            `DELETE FROM marks
             WHERE courcecode = ?
             AND semoryear = ?
             AND subjectcode = ?`,
            [course, sem, subject]
        );

        res.json({ message: "All marks deleted for this subject" });

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Delete failed" });

    }

};


// ============================
// Subject Wise Marks Report
// ============================

exports.getSubjectReport = async (req, res) => {

    try {

        const { course, sem, subject } = req.query;

        const [rows] = await db.query(
            `SELECT
                 s.rollnumber,
                 s.firstname,
                 s.lastname,
                 m.theorymarks,
                 m.practicalmarks,
                 sub.theorymarks AS theoryfull,
                 sub.practicalmarks AS practicalfull
             FROM students s
             LEFT JOIN marks m
               ON m.rollnumber = s.rollnumber
               AND m.subjectcode = ?
               AND m.courcecode = ?
               AND m.semoryear = ?
             JOIN subject sub
               ON sub.subjectcode = ?
             WHERE s.Courcecode = ?
             AND s.semoryear = ?
             ORDER BY s.rollnumber`,
            [subject, course, sem, subject, course, sem]
        );

        const data = rows.map(r => {

            const theory = r.theorymarks || 0;
            const practical = r.practicalmarks || 0;
            const total = theory + practical;

            let grade = "F";

            if (total >= 90) grade = "O";
            else if (total >= 80) grade = "A+";
            else if (total >= 70) grade = "A";
            else if (total >= 60) grade = "B+";
            else if (total >= 50) grade = "B";
            else if (total >= 40) grade = "C";

            return {
                rollnumber: r.rollnumber,
                name: r.firstname + " " + r.lastname,
                theorymarks: theory,
                practicalmarks: practical,
                theoryfull: r.theoryfull,
                practicalfull: r.practicalfull,
                maxtotal: (r.theoryfull || 0) + (r.practicalfull || 0),
                total,
                grade
            };

        });

        res.json(data);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Error fetching subject report" });

    }

};


// ============================
// Get Subjects For Marks
// ============================

exports.getSubjects = async (req, res) => {

    try {

        const { course, sem } = req.query;

        const [rows] = await db.query(
            `SELECT subjectcode, subjectname
             FROM subject
             WHERE courcecode = ?
             AND semoryear = ?
             ORDER BY subjectcode`,
            [course, sem]
        );

        res.json(rows);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Error fetching subjects" });

    }

};

// ============================
// Get Student Marksheet
// ============================

exports.getStudentMarksheet = async (req, res) => {

    try {

        const { course, sem, roll } = req.query;

        if (!course || !sem || !roll) {
            return res.status(400).json({ message: "Missing parameters" });
        }

        // ============================
        // Get College Info
        // ============================

        const [adminRows] = await db.query(
            `SELECT collagename, logo FROM admin LIMIT 1`
        );

        const collegeName = adminRows.length
            ? adminRows[0].collagename
            : "College";

        const logoFile = getAdminLogo();
        const collegeLogo = `/uploads/admin/${logoFile}`;

        // ============================
        // Fetch Student Marks
        // ============================

        const [rows] = await db.query(
            `SELECT
                 s.firstname,
                 s.lastname,
                 s.rollnumber,
                 s.courcecode,
                 s.profilepic,
                 m.subjectcode,
                 m.subjectname,
                 sub.theorymarks AS theoryfull,
                 sub.practicalmarks AS practicalfull,
                 m.theorymarks,
                 m.practicalmarks
             FROM marks m
                      JOIN students s
                           ON m.rollnumber = s.rollnumber
                      JOIN subject sub
                           ON sub.subjectcode = m.subjectcode
             WHERE m.courcecode = ?
               AND m.semoryear = ?
               AND m.rollnumber = ?
             ORDER BY m.subjectcode`,
            [course, sem, roll]
        );

        if (!rows.length) {

            return res.json({
                collegeName,
                collegeLogo,
                marks: [],
                summary: null
            });

        }

        // Ensure profile pic exists
        rows.forEach(r => {
            if (!r.profilepic) {
                r.profilepic = "default.png";
            }
        });

        // ============================
        // Calculate Totals
        // ============================

        let totalObtained = 0;
        let totalMaximum = 0;
        let subjectFailed = false;

        rows.forEach(r => {

            const theory = r.theorymarks ?? 0;
            const practical = r.practicalmarks ?? 0;

            const theoryFull = r.theoryfull ?? 0;
            const practicalFull = r.practicalfull ?? 0;

            const subjectTotal = theory + practical;
            const subjectMax = theoryFull + practicalFull;

            totalObtained += subjectTotal;
            totalMaximum += subjectMax;

            const subjectPercentage =
                subjectMax ? (subjectTotal / subjectMax) * 100 : 0;

            if (subjectPercentage < 40) {
                subjectFailed = true;
            }

        });

        // ============================
        // Percentage
        // ============================

        let percentage = totalMaximum
            ? (totalObtained / totalMaximum) * 100
            : 0;

        percentage = Number(percentage.toFixed(2));

        // ============================
        // Final Grade
        // ============================

        let finalGrade = "F";

        if (percentage >= 90) finalGrade = "O";
        else if (percentage >= 80) finalGrade = "A+";
        else if (percentage >= 70) finalGrade = "A";
        else if (percentage >= 60) finalGrade = "B+";
        else if (percentage >= 50) finalGrade = "B";
        else if (percentage >= 40) finalGrade = "C";

        // ============================
        // Result + Division
        // ============================

        let result = "FAIL";
        let division = "N/A";

        if (!subjectFailed) {

            result = "PASS";

            if (percentage >= 75) {
                result = "PASS WITH DISTINCTION";
                division = "FIRST CLASS WITH DISTINCTION";
            }
            else if (percentage >= 60) {
                division = "FIRST CLASS";
            }
            else if (percentage >= 50) {
                division = "SECOND CLASS";
            }
            else if (percentage >= 40) {
                division = "PASS";
            }

        } else {

            result = "FAIL (BACKLOG)";
            division = "N/A";

        }

        // ============================
        // Response
        // ============================

        res.json({
            collegeName,
            collegeLogo,
            marks: rows,
            summary: {
                totalObtained,
                totalMaximum,
                percentage,
                finalGrade,
                division,
                result
            }
        });

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Error fetching marksheet" });

    }

};