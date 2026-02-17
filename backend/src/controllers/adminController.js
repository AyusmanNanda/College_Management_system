const db = require("../config/db");
const bcrypt = require("bcrypt");

// Create Faculty (Admin Only)
exports.createFaculty = async (req, res) => {
    const {
        username,
        email,
        password,
        faculty_name,
        qualification,
        experience,
        joined_date
    } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1️⃣ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2️⃣ Insert into users
        const [userResult] = await connection.query(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [username, email, hashedPassword, "faculty"]
        );

        const userId = userResult.insertId;

        // 3️⃣ Insert into faculties
        await connection.query(
            "INSERT INTO faculties (user_id, faculty_name, qualification, experience, joined_date) VALUES (?, ?, ?, ?, ?)",
            [userId, faculty_name, qualification, experience, joined_date]
        );

        await connection.commit();

        res.status(201).json({
            message: "Faculty created successfully"
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: "Error creating faculty" });
    } finally {
        connection.release();
    }
};
// Get All Faculties (Admin Only)
exports.getAllFaculties = async (req, res) => {
    try {
        const [faculties] = await db.query(`
            SELECT 
                f.id,
                f.faculty_name,
                f.qualification,
                f.experience,
                f.joined_date,
                u.username,
                u.email
            FROM faculties f
            JOIN users u ON f.user_id = u.id
        `);

        res.json(faculties);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching faculties" });
    }
};

// Update Faculty (Admin Only)
exports.updateFaculty = async (req, res) => {
    const { id } = req.params;
    const { faculty_name, qualification, experience, joined_date } = req.body;

    try {
        const [result] = await db.query(
            `
            UPDATE faculties
            SET faculty_name = ?, qualification = ?, experience = ?, joined_date = ?
            WHERE id = ?
            `,
            [faculty_name, qualification, experience, joined_date, id]
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
