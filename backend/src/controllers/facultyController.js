const db = require("../config/db");

/*
  Faculty Controller
  ------------------
  Handles:
  - Create faculty
  - Get all faculties
  - Update faculty
  - Delete faculty
*/


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
        await db.query(
            `INSERT INTO faculties
             (facultyid, facultyname, state, city, emailid, contactnumber, qualification, experience, birthdate, gender, activestatus)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
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
                gender
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
                 activestatus
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
        const [result] = await db.query(
            `UPDATE faculties SET
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
             WHERE sr_no = ?`,
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
                id
            ]
        );

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