const db = require("../config/db");

// =========================================================
// Public Marksheet Verification Controller
// Description: Unauthenticated endpoint for employers and
// institutions to verify a student's marksheet via QR code.
// =========================================================

exports.verifyMarksheet = async (req, res) => {
    try {
        const { marksheetId } = req.params;

        // 1. Parse the Marksheet ID (Format: MS-COURSE-SEM-ROLLNUMBER)
        const parts = marksheetId.split('-');

        if (parts.length !== 4 || parts[0] !== 'MS') {
            return res.status(400).json({
                isValid: false,
                message: "Invalid Marksheet ID format."
            });
        }

        const courseCode = parts[1];
        const sem = parts[2];
        const rollNumber = parts[3];

        // 2. Get College Info
        const [adminRows] = await db.query(`SELECT collagename FROM admin LIMIT 1`);
        const collegeName = adminRows.length ? adminRows[0].collagename : "College";

        // 3. Fetch Student Data
        // Using your exact column names: Courcecode, semoryear
        const [studentRows] = await db.query(
            `SELECT firstname, lastname, rollnumber, profilepic 
             FROM students 
             WHERE rollnumber = ? AND Courcecode = ? AND semoryear = ?`,
            [rollNumber, courseCode, sem]
        );

        if (!studentRows.length) {
            return res.status(404).json({
                isValid: false,
                message: "No student found matching this verification ID."
            });
        }
        const student = studentRows[0];

        // 4. Fetch Student Marks
        // Joining 'marks' and 'subject' tables exactly as your schema dictates
        const [marksRows] = await db.query(
            `SELECT 
                 m.subjectcode, 
                 m.subjectname, 
                 sub.theorymarks AS theoryfull, 
                 sub.practicalmarks AS practicalfull, 
                 m.theorymarks, 
                 m.practicalmarks, 
                 sub.subjecttype
             FROM marks m
             JOIN subject sub ON sub.subjectcode = m.subjectcode
             WHERE m.courcecode = ? AND m.semoryear = ? AND m.rollnumber = ?
             ORDER BY m.subjectcode`,
            [courseCode, sem, rollNumber]
        );

        if (!marksRows.length) {
            return res.status(404).json({
                isValid: false,
                message: "Marksheet data not found for this semester."
            });
        }

        // 5. Calculate Totals & Process Marks
        let totalObtained = 0;
        let totalMaximum = 0;
        let subjectFailed = false;

        const processedMarks = marksRows.map(r => {
            const theory = r.theorymarks ?? 0;
            const practical = r.practicalmarks ?? 0;
            const theoryFull = r.theoryfull ?? 0;
            const practicalFull = r.practicalfull ?? 0;

            const subjectTotal = theory + practical;
            const subjectMax = theoryFull + practicalFull;

            totalObtained += subjectTotal;
            totalMaximum += subjectMax;

            // Passing criteria: >= 40% in the subject
            const subjectPercentage = subjectMax ? (subjectTotal / subjectMax) * 100 : 0;
            if (subjectPercentage < 40) subjectFailed = true;

            return {
                subjectcode: r.subjectcode,
                subjectname: r.subjectname,
                type: r.subjecttype,
                theory: { obtained: theory, max: theoryFull },
                practical: { obtained: practical, max: practicalFull },
                total: { obtained: subjectTotal, max: subjectMax },
                status: (subjectPercentage >= 40) ? "PASS" : "FAIL"
            };
        });

        // 6. Overall Percentage & Grade Logic
        let percentage = totalMaximum ? (totalObtained / totalMaximum) * 100 : 0;
        percentage = Number(percentage.toFixed(2));

        let finalGrade = "F";
        if (percentage >= 90) finalGrade = "O";
        else if (percentage >= 80) finalGrade = "A+";
        else if (percentage >= 70) finalGrade = "A";
        else if (percentage >= 60) finalGrade = "B+";
        else if (percentage >= 50) finalGrade = "B";
        else if (percentage >= 40) finalGrade = "C";

        // 7. Result & Division Logic
        let result = "FAIL (BACKLOG)";
        let division = "N/A";

        if (!subjectFailed) {
            result = "PASS";
            if (percentage >= 75) {
                result = "PASS WITH DISTINCTION";
                division = "FIRST CLASS WITH DISTINCTION";
            }
            else if (percentage >= 60) { division = "FIRST CLASS"; }
            else if (percentage >= 50) { division = "SECOND CLASS"; }
            else if (percentage >= 40) { division = "PASS"; }
        }

        // 8. Send Verification Payload
        res.json({
            isValid: true,
            verificationId: marksheetId,
            collegeName,
            student: {
                rollnumber: student.rollnumber,
                name: `${student.firstname} ${student.lastname}`.trim(),
                profilepic: student.profilepic || "default.png"
            },
            academic: {
                courseCode,
                semester: sem
            },
            performance: {
                marks: processedMarks,
                summary: {
                    totalObtained,
                    totalMaximum,
                    percentage,
                    finalGrade,
                    division,
                    result
                }
            }
        });

    } catch (error) {
        console.error("Marksheet Verification Error:", error);
        res.status(500).json({
            isValid: false,
            message: "Internal server error during verification."
        });
    }
};