const db = require("../config/db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const ExcelJS = require("exceljs");
const XLSX = require("xlsx");
const fs = require("fs");

/*
  Faculty Controller
  ------------------
  Handles:
  - Create faculty
  - Get faculties
  - Update faculty
  - Delete faculty
*/


// ============================
// Multer Storage Configuration
// ============================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/faculties");
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        cb(null, uniqueName);
    }
});

exports.upload = multer({ storage });

// ============================
// Excel Upload Middleware
// ============================
const excelStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/temp");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

exports.uploadExcel = multer({
    storage: excelStorage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".xlsx" && ext !== ".xls") {
            return cb(new Error("Only Excel files allowed"));
        }
        cb(null, true);
    }
});

// ============================
// Create Faculty
// ============================
exports.createFaculty = async (req, res) => {
    const {
        facultyid,
        facultyname,
        state,
        city,
        emailid,
        contactnumber,
        qualification,
        experience,
        birthdate,
        gender,
        courcecode,
        semoryear,
        subject,
        position,
        joineddate,
        password
    } = req.body;

    // ============================
    // Mandatory Field Validation
    // ============================
    if (
        !facultyid ||
        !facultyname ||
        !state ||
        !city ||
        !emailid ||
        !contactnumber ||
        !qualification ||
        !experience ||
        !birthdate ||
        !gender
    ) {
        return res.status(400).json({
            message: "All required fields must be filled"
        });
    }

    try {
        // ============================
        // Default Password = DOB (if not provided)
        // ============================
        const finalPassword = password && password.trim() !== ""
            ? password
            : birthdate;

        const hashedPassword = await bcrypt.hash(finalPassword, 10);

        // ============================
        // Default Profile Pic
        // ============================
        const profilepic = req.file
            ? req.file.filename
            : "default.png";

        // ============================
        // Optional Defaults
        // ============================
        const finalCourse = courcecode || "NOT ASSIGNED";
        const finalSem = semoryear || 0;
        const finalSubject = subject || "NOT ASSIGNED";
        const finalPosition = position || "NOT ASSIGNED";
        const finalJoinedDate = joineddate || new Date().toISOString();
        const activestatus = 0;

        await db.query(
            `INSERT INTO faculties
             (facultyid, facultyname, state, city, emailid, contactnumber,
              qualification, experience, birthdate, gender, profilepic,
              courcecode, semoryear, subject, position,
              joineddate, password, activestatus)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                facultyid,
                facultyname.trim(),
                state.trim(),
                city.trim(),
                emailid.trim(),
                contactnumber.trim(),
                qualification.trim(),
                experience.trim(),
                birthdate,
                gender,
                profilepic,
                finalCourse,
                finalSem,
                finalSubject,
                finalPosition,
                finalJoinedDate,
                hashedPassword,
                activestatus
            ]
        );

        res.status(201).json({
            message: "Faculty created successfully"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Email or Faculty ID already exists"
            });
        }

        console.error(error);
        res.status(500).json({
            message: "Error creating faculty"
        });
    }
};


// ============================
// Get All Faculties (WITH JOIN)
// ============================
exports.getFaculties = async (req, res) => {
    try {
        const [faculties] = await db.query(`
            SELECT
                f.sr_no,
                f.facultyid,
                f.facultyname,
                f.state,
                f.city,
                f.emailid,
                f.contactnumber,
                f.qualification,
                f.experience,
                f.birthdate,
                f.gender,
                f.courcecode,
                COALESCE(c.course_name, NULL) AS course_name,
                f.semoryear,
                f.subject,
                COALESCE(s.subjectname, NULL) AS subject_name,
                f.position,
                f.joineddate,
                f.activestatus,
                f.profilepic
            FROM faculties f
                     LEFT JOIN courses c
                               ON f.courcecode = c.course_code
                     LEFT JOIN subject s
                               ON f.subject = s.subjectcode
            ORDER BY f.sr_no DESC
        `);

        res.json(faculties);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching faculties"
        });
    }
};

// ============================
// Update Faculty
// ============================
exports.updateFaculty = async (req, res) => {
    const { id } = req.params;

    const {
        facultyid,
        facultyname,
        state,
        city,
        emailid,
        contactnumber,
        qualification,
        experience,
        birthdate,
        gender,
        courcecode,
        semoryear,
        subject,
        position,
        joineddate,
        password
    } = req.body;

    if (
        !facultyid ||
        !facultyname ||
        !state ||
        !city ||
        !emailid ||
        !contactnumber ||
        !qualification ||
        !experience ||
        !birthdate ||
        !gender
    ) {
        return res.status(400).json({
            message: "All required fields must be filled"
        });
    }

    try {
        const profilepic = req.file ? req.file.filename : null;

        let query = `
            UPDATE faculties SET
                                 facultyid = ?,
                                 facultyname = ?,
                                 state = ?,
                                 city = ?,
                                 emailid = ?,
                                 contactnumber = ?,
                                 qualification = ?,
                                 experience = ?,
                                 birthdate = ?,
                                 gender = ?,
                                 courcecode = ?,
                                 semoryear = ?,
                                 subject = ?,
                                 position = ?,
                                 joineddate = ?
        `;

        const values = [
            facultyid,
            facultyname.trim(),
            state.trim(),
            city.trim(),
            emailid.trim(),
            contactnumber.trim(),
            qualification.trim(),
            experience.trim(),
            birthdate,
            gender,
            courcecode || "NOT ASSIGNED",
            semoryear || 0,
            subject || "NOT ASSIGNED",
            position || "NOT ASSIGNED",
            joineddate || null
        ];

        if (profilepic) {
            query += `, profilepic = ?`;
            values.push(profilepic);
        }

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += `, password = ?`;
            values.push(hashedPassword);
        }

        query += ` WHERE sr_no = ?`;
        values.push(id);

        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        res.json({
            message: "Faculty updated successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error updating faculty"
        });
    }
};


// ============================
// Delete Faculty
// ============================
exports.deleteFaculty = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query(
            "DELETE FROM faculties WHERE sr_no = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        res.json({ message: "Faculty deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting faculty" });
    }
};
exports.downloadFacultyTemplate = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Faculties");
        const dropdownSheet = workbook.addWorksheet("DropdownData");

        // ===============================
        // Fetch Courses (Departments)
        // ===============================
        const [courses] = await db.query(
            "SELECT course_code, course_name FROM courses"
        );

        // ===============================
        // Dropdown Static Values
        // ===============================
        const genders = ["Male", "Female", "Other"];
        const positions = [
            "Professor",
            "Assistant Professor",
            "Lecturer",
            "HOD",
            "NOT ASSIGNED"
        ];

        // ===============================
        // Add Dropdown Data
        // ===============================
        dropdownSheet.getColumn(1).values = ["Gender", ...genders];
        dropdownSheet.getColumn(2).values = [
            "Department",
            ...courses.map(c => c.course_code)
        ];
        dropdownSheet.getColumn(3).values = ["Position", ...positions];

        dropdownSheet.state = "hidden";

        // ===============================
        // Main Headers
        // ===============================
        const headers = [
            "facultyid",
            "facultyname",
            "state",
            "city",
            "emailid",
            "contactnumber",
            "qualification",
            "experience",
            "birthdate",
            "gender",
            "courcecode",
            "position",
            "joineddate"
        ];

        sheet.addRow(headers);

        sheet.columns.forEach(col => {
            col.width = 22;
        });

        // Bold Header
        sheet.getRow(1).font = { bold: true };

        // ===============================
        // Add Data Validation
        // ===============================

        // Gender Dropdown
        sheet.getColumn("J").eachCell((cell, rowNumber) => {
            if (rowNumber > 1) {
                cell.dataValidation = {
                    type: "list",
                    allowBlank: false,
                    formulae: ["DropdownData!$A$2:$A$4"]
                };
            }
        });

        // Department Dropdown
        const deptLastRow = courses.length + 1;
        sheet.getColumn("K").eachCell((cell, rowNumber) => {
            if (rowNumber > 1) {
                cell.dataValidation = {
                    type: "list",
                    allowBlank: false,
                    formulae: [`DropdownData!$B$2:$B$${deptLastRow}`]
                };
            }
        });

        // Position Dropdown
        sheet.getColumn("L").eachCell((cell, rowNumber) => {
            if (rowNumber > 1) {
                cell.dataValidation = {
                    type: "list",
                    allowBlank: true,
                    formulae: ["DropdownData!$C$2:$C$6"]
                };
            }
        });

        // ===============================
        // Add Example Row (Optional but helpful)
        // ===============================
        sheet.addRow([
            "1001",
            "John Doe",
            "Odisha",
            "Bhubaneswar",
            "john@example.com",
            "9876543210",
            "MCA",
            "5 Years",
            "01-01-2000",
            "Male",
            courses[0]?.course_code || "",
            "Assistant Professor",
            ""
        ]);

        // ===============================
        // Send File
        // ===============================
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Faculty_Import_Template.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error generating template"
        });
    }
};

// ============================
// Import Faculties From Excel
// ============================
exports.importFacultiesFromExcel = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded"
        });
    }

    const filePath = req.file.path;

    let totalRows = 0;
    let inserted = 0;
    let duplicates = 0;
    let invalidRows = 0;
    const errors = [];

    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(sheet);

        totalRows = data.length;

        for (let i = 0; i < data.length; i++) {

            const row = data[i];

            // ============================
            // Extract & Normalize Fields
            // ============================

            let facultyid = row.facultyid;
            let facultyname = row.facultyname;
            let state = row.state;
            let city = row.city;
            let emailid = row.emailid;
            let contactnumber = row.contactnumber;
            let qualification = row.qualification;
            let experience = row.experience;
            let birthdate = row.birthdate;
            let gender = row.gender;
            let courcecode = row.courcecode;
            let position = row.position;
            let joineddate = row.joineddate;

            // ============================
            // Skip Completely Empty Rows
            // ============================

            if (
                !facultyid &&
                !facultyname &&
                !emailid
            ) {
                continue;
            }

            // ============================
            // Clean Faculty ID
            // ============================

            if (!facultyid) {
                invalidRows++;
                errors.push({
                    row: i + 2,
                    reason: "Missing Faculty ID"
                });
                continue;
            }

            facultyid = String(facultyid)
                .replace(/'/g, "")
                .trim();

            if (isNaN(facultyid)) {
                invalidRows++;
                errors.push({
                    row: i + 2,
                    reason: "Invalid Faculty ID format"
                });
                continue;
            }

            facultyid = parseInt(facultyid);

            // ============================
            // Trim Other Fields
            // ============================

            facultyname = facultyname ? String(facultyname).trim() : "";
            state = state ? String(state).trim() : "";
            city = city ? String(city).trim() : "";
            emailid = emailid ? String(emailid).trim() : "";
            contactnumber = contactnumber ? String(contactnumber).trim() : "";
            qualification = qualification ? String(qualification).trim() : "";
            experience = experience ? String(experience).trim() : "";
            birthdate = birthdate ? String(birthdate).trim() : "";
            gender = gender ? String(gender).trim() : "";
            courcecode = courcecode ? String(courcecode).trim() : "";
            position = position ? String(position).trim() : "NOT ASSIGNED";
            joineddate = joineddate ? String(joineddate).trim() : null;

            // ============================
            // Validate Required Fields
            // ============================

            if (
                !facultyname ||
                !state ||
                !city ||
                !emailid ||
                !contactnumber ||
                !qualification ||
                !experience ||
                !birthdate ||
                !gender ||
                !courcecode
            ) {
                invalidRows++;
                errors.push({
                    row: i + 2,
                    reason: "Missing required fields"
                });
                continue;
            }

            try {

                // ============================
                // Default Password = DOB
                // ============================

                const hashedPassword = await bcrypt.hash(
                    birthdate,
                    10
                );

                // ============================
                // Insert Into Database
                // ============================

                await db.query(
                    `INSERT INTO faculties
             (facultyid, facultyname, state, city, emailid,
              contactnumber, qualification, experience,
              birthdate, gender, profilepic, courcecode,
              semoryear, subject, position,
              joineddate, password, activestatus)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        facultyid,
                        facultyname,
                        state,
                        city,
                        emailid,
                        contactnumber,
                        qualification,
                        experience,
                        birthdate,
                        gender,
                        "default.png",
                        courcecode,
                        0,
                        "NOT ASSIGNED",
                        position,
                        joineddate || new Date().toISOString(),
                        hashedPassword,
                        0
                    ]
                );

                inserted++;

            } catch (error) {

                if (error.code === "ER_DUP_ENTRY") {
                    duplicates++;
                    errors.push({
                        row: i + 2,
                        reason: "Duplicate faculty ID or Email"
                    });
                } else {
                    invalidRows++;
                    errors.push({
                        row: i + 2,
                        reason: "Database error"
                    });
                }
            }
        }

        // Delete temp file
        fs.unlinkSync(filePath);

        res.json({
            totalRows,
            inserted,
            duplicates,
            invalidRows,
            errors
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Import failed"
        });
    }
};