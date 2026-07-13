const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const ExcelJS = require("exceljs");
const XLSX = require("xlsx");

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

        const result = await db.query(
            `SELECT rollnumber, firstname, lastname
             FROM students
             WHERE Courcecode = $1 AND semoryear = $2
             ORDER BY rollnumber`,
            [course, sem]
        );

        res.json(result.rows);

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
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                     ON CONFLICT (courcecode, semoryear, subjectcode, rollnumber)
                 DO UPDATE SET
                    theorymarks = EXCLUDED.theorymarks,
                                             practicalmarks = EXCLUDED.practicalmarks`,
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


// ===== TEMPLATE DOWNLOAD =====

exports.downloadMarksTemplate = async (req, res) => {
    try {
        const { course, sem, subject } = req.query;

        if (!course || !sem || !subject) {
            return res.status(400).json({ message: "course, sem and subject are required" });
        }

        const subjectResult = await db.query(
            `SELECT subjectname, theorymarks, practicalmarks
             FROM subject
             WHERE subjectcode = $1 AND courcecode = $2 AND semoryear = $3`,
            [subject, course, sem]
        );

        const subjectRows = subjectResult.rows;

        if (!subjectRows.length) {
            return res.status(404).json({ message: "Subject not found" });
        }

        const subjectInfo = subjectRows[0];

        const studentResult = await db.query(
            `SELECT rollnumber
             FROM students
             WHERE Courcecode = $1 AND semoryear = $2
             LIMIT 1`,
            [course, sem]
        );

        const studentRows = studentResult.rows;

        const demoRoll = studentRows.length ? String(studentRows[0].rollnumber) : "";

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Marks Template");

        // DB-like structure
        worksheet.columns = [
            { header: "courcecode", key: "courcecode", width: 18 },
            { header: "semoryear", key: "semoryear", width: 15 },
            { header: "subjectcode", key: "subjectcode", width: 18 },
            { header: "subjectname", key: "subjectname", width: 28 },
            { header: "rollnumber", key: "rollnumber", width: 18 },
            { header: "theorymarks", key: "theorymarks", width: 18 },
            { header: "practicalmarks", key: "practicalmarks", width: 18 }
        ];

        worksheet.addRow({
            courcecode: course,
            semoryear: sem,
            subjectcode: subject,
            subjectname: subjectInfo.subjectname || "",
            rollnumber: demoRoll,
            theorymarks: Number(subjectInfo.theorymarks || 0) > 0
                ? Math.min(Number(subjectInfo.theorymarks), 50)
                : 0,
            practicalmarks: Number(subjectInfo.practicalmarks || 0) > 0
                ? Math.min(Number(subjectInfo.practicalmarks), 20)
                : 0
        });

        worksheet.getRow(1).font = { bold: true };

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="Marks_Template.xlsx"'
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Download marks template error:", err);
        res.status(500).json({ message: "Failed to download template" });
    }
};


// ===== IMPORT MARKS =====

exports.importMarks = async (req, res) => {
    try {
        const { course, sem, subject } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Excel file is required" });
        }

        if (!course || !sem || !subject) {
            return res.status(400).json({ message: "course, sem and subject are required" });
        }

        const subjectResult = await db.query(
            `SELECT subjectname, theorymarks, practicalmarks
             FROM subject
             WHERE subjectcode = $1 AND courcecode = $2 AND semoryear = $3`,
            [subject, course, sem]
        );

        const subjectRows = subjectResult.rows;

        if (!subjectRows.length) {
            return res.status(404).json({ message: "Subject not found" });
        }

        const subjectInfo = subjectRows[0];
        const maxTheory = Number(subjectInfo.theorymarks || 0);
        const maxPractical = Number(subjectInfo.practicalmarks || 0);

        const studentResult = await db.query(
            `SELECT rollnumber
             FROM students
             WHERE Courcecode = $1 AND semoryear = $2`,
            [course, sem]
        );

        const studentRows = studentResult.rows;

        const validRolls = new Set(
            studentRows.map((s) => String(s.rollnumber).trim())
        );

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rows.length) {
            return res.status(400).json({ message: "Excel file is empty" });
        }

        const values = [];
        const errors = [];
        let invalidRows = 0;

        rows.forEach((row, index) => {
            const excelRow = index + 2;

            // Accept DB-like column names from template
            const courcecode = String(row.courcecode || course).trim();
            const semoryear = String(row.semoryear || sem).trim();
            const subjectcode = String(row.subjectcode || subject).trim();
            const subjectname = String(
                row.subjectname || subjectInfo.subjectname || ""
            ).trim();

            const rollnumber = String(row.rollnumber || "").trim();

            const theoryRaw = row.theorymarks;
            const practicalRaw = row.practicalmarks;

            if (!rollnumber) {
                invalidRows++;

                errors.push({
                    row: excelRow,
                    reason: "rollnumber is required"
                });

                return;
            }

            if (!validRolls.has(rollnumber)) {
                invalidRows++;

                errors.push({
                    row: excelRow,
                    reason: `Student not found for rollnumber ${rollnumber}`
                });

                return;
            }

            if (
                courcecode !== String(course) ||
                semoryear !== String(sem) ||
                subjectcode !== String(subject)
            ) {
                invalidRows++;

                errors.push({
                    row: excelRow,
                    reason: "courcecode, semoryear or subjectcode does not match selected subject"
                });

                return;
            }

            const theorymarks =
                theoryRaw === "" ||
                theoryRaw === null ||
                theoryRaw === undefined
                    ? 0
                    : Number(theoryRaw);

            const practicalmarks =
                practicalRaw === "" ||
                practicalRaw === null ||
                practicalRaw === undefined
                    ? 0
                    : Number(practicalRaw);

            if (Number.isNaN(theorymarks) || theorymarks < 0) {
                invalidRows++;

                errors.push({
                    row: excelRow,
                    reason: "theorymarks must be a valid number"
                });

                return;
            }

            if (Number.isNaN(practicalmarks) || practicalmarks < 0) {
                invalidRows++;

                errors.push({
                    row: excelRow,
                    reason: "practicalmarks must be a valid number"
                });

                return;
            }

            if (theorymarks > maxTheory) {
                invalidRows++;

                errors.push({
                    row: excelRow,
                    reason: `theorymarks cannot exceed ${maxTheory}`
                });

                return;
            }

            if (practicalmarks > maxPractical) {
                invalidRows++;

                errors.push({
                    row: excelRow,
                    reason: `practicalmarks cannot exceed ${maxPractical}`
                });

                return;
            }

            values.push([
                courcecode,
                Number(semoryear),
                subjectcode,
                subjectname || null,
                rollnumber,
                theorymarks,
                practicalmarks
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

        const placeholders = values.map((_, index) => {
            const offset = index * 7;

            return `(
                $${offset + 1},
                $${offset + 2},
                $${offset + 3},
                $${offset + 4},
                $${offset + 5},
                $${offset + 6},
                $${offset + 7}
            )`;
        }).join(", ");

        const flattenedValues = values.flat();

        await db.query(
            `INSERT INTO marks
             (courcecode, semoryear, subjectcode, subjectname, rollnumber, theorymarks, practicalmarks)
             VALUES ${placeholders}
                 ON CONFLICT (courcecode, semoryear, subjectcode, rollnumber)
             DO UPDATE SET
                theorymarks = EXCLUDED.theorymarks,
                                     practicalmarks = EXCLUDED.practicalmarks,
                                     subjectname = EXCLUDED.subjectname`,
            flattenedValues
        );

        res.json({
            message: "Marks imported successfully",
            totalRows: rows.length,
            inserted: values.length,
            invalidRows,
            errors
        });

    } catch (err) {
        console.error("Import marks error:", err);
        res.status(500).json({ message: "Import failed" });
    }
};


// ============================
// Get Marks For Editing
// ============================

exports.getMarksForEdit = async (req, res) => {

    try {

        const { course, sem, subject } = req.query;

        const result = await db.query(
            `SELECT
                 s.rollnumber,
                 s.firstname,
                 s.lastname,
                 m.theorymarks,
                 m.practicalmarks
             FROM students s
             LEFT JOIN marks m
               ON s.rollnumber = m.rollnumber
               AND m.subjectcode = $1
               AND m.courcecode = $2
               AND m.semoryear = $3
             WHERE s.Courcecode = $4
             AND s.semoryear = $5
             ORDER BY s.rollnumber`,
            [subject, course, sem, course, sem]
        );

        res.json(result.rows);

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
                 SET theorymarks = $1, practicalmarks = $2
                 WHERE rollnumber = $3
                   AND subjectcode = $4
                   AND courcecode = $5
                   AND semoryear = $6`,
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

        const result = await db.query(
            `SELECT
                 m.rollnumber,
                 CONCAT(s.firstname, ' ', s.lastname) AS name,
                 m.subjectcode,
                 m.theorymarks,
                 m.practicalmarks
             FROM marks m
             JOIN students s
             ON m.rollnumber = s.rollnumber
             WHERE m.courcecode = $1
             AND m.semoryear = $2
             ORDER BY m.rollnumber`,
            [course, sem]
        );

        res.json(result.rows);

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
             WHERE courcecode = $1
               AND semoryear = $2
               AND subjectcode = $3
               AND rollnumber = $4`,
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
             WHERE courcecode = $1
               AND semoryear = $2
               AND subjectcode = $3`,
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

        const result = await db.query(
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
               AND m.subjectcode = $1
               AND m.courcecode = $2
               AND m.semoryear = $3
             JOIN subject sub
               ON sub.subjectcode = $4
             WHERE s.Courcecode = $5
             AND s.semoryear = $6
             ORDER BY s.rollnumber`,
            [subject, course, sem, subject, course, sem]
        );

        const rows = result.rows;

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

        const result = await db.query(
            `SELECT subjectcode, subjectname
             FROM subject
             WHERE courcecode = $1
             AND semoryear = $2
             ORDER BY subjectcode`,
            [course, sem]
        );

        res.json(result.rows);

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

        const adminResult = await db.query(
            `SELECT collagename, logo FROM admin LIMIT 1`
        );

        const adminRows = adminResult.rows;

        const collegeName = adminRows.length
            ? adminRows[0].collagename
            : "College";

        const logoFile = getAdminLogo();
        const collegeLogo = `/uploads/admin/${logoFile}`;

        // ============================
        // Fetch Student Marks
        // ============================

        const marksResult = await db.query(
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
             WHERE m.courcecode = $1
               AND m.semoryear = $2
               AND m.rollnumber = $3
             ORDER BY m.subjectcode`,
            [course, sem, roll]
        );

        const rows = marksResult.rows;

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