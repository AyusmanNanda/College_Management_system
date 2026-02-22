const db = require("../config/db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

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
        gender
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
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Default password = birthdate
        const defaultPassword = birthdate;
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const profilepic = req.file ? req.file.filename : null;

        await db.query(
            `INSERT INTO faculties
             (facultyid, facultyname, state, city, emailid, contactnumber, qualification, experience, birthdate, gender, profilepic, password, activestatus)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
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
                hashedPassword
            ]
        );

        res.status(201).json({ message: "Faculty created successfully" });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Faculty ID already exists"
            });
        }

        console.error(error);
        res.status(500).json({ message: "Error creating faculty" });
    }
};


// ============================
// Get All Faculties
// ============================
exports.getFaculties = async (req, res) => {
    try {
        const [faculties] = await db.query(
            `SELECT 
                sr_no,
                facultyid,
                facultyname,
                emailid,
                qualification,
                experience,
                activestatus,
                profilepic
             FROM faculties
             ORDER BY sr_no DESC`
        );

        res.json(faculties);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching faculties" });
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
        gender
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
        return res.status(400).json({ message: "All fields are required" });
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
                gender = ?
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
            gender
        ];

        // Update image only if new file uploaded
        if (profilepic) {
            query += `, profilepic = ?`;
            values.push(profilepic);
        }

        query += ` WHERE sr_no = ?`;
        values.push(id);

        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        res.json({ message: "Faculty updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating faculty" });
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