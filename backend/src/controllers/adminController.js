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
// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
    try {
        const adminId = req.user.id; // From auth middleware

        const [rows] = await db.query(
            "SELECT id, username, email, last_login, active_status FROM users WHERE id = ? AND role = 'admin'",
            [adminId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching admin profile" });
    }
};
// Update Admin Profile
exports.updateAdminProfile = async (req, res) => {
    const adminId = req.user.id;
    const { email, password, active_status } = req.body;

    try {
        let hashedPassword = null;

        // Hash new password if provided
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        await db.query(
            `
            UPDATE users
            SET email = ?, 
                password = COALESCE(?, password),
                active_status = ?
            WHERE id = ? AND role = 'admin'
            `,
            [email, hashedPassword, active_status, adminId]
        );

        res.json({ message: "Admin profile updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating admin profile" });
    }
};
// Get College Info
exports.getCollegeInfo = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM college_info LIMIT 1");

        if (rows.length === 0) {
            return res.json({});
        }

        res.json(rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching college info" });
    }
};
// Update College Info
exports.updateCollegeInfo = async (req, res) => {
    const {
        college_name,
        address,
        email,
        contact_number,
        website,
        facebook,
        instagram,
        twitter,
        linkedin,
        logo
    } = req.body;

    try {
        const [rows] = await db.query("SELECT id FROM college_info LIMIT 1");

        if (rows.length === 0) {
            // Insert if not exists
            await db.query(
                `
                INSERT INTO college_info 
                (college_name, address, email, contact_number, website, facebook, instagram, twitter, linkedin, logo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [college_name, address, email, contact_number, website, facebook, instagram, twitter, linkedin, logo]
            );
        } else {
            // Update existing
            await db.query(
                `
                UPDATE college_info
                SET college_name = ?, address = ?, email = ?, contact_number = ?, website = ?, 
                    facebook = ?, instagram = ?, twitter = ?, linkedin = ?, logo = ?
                WHERE id = ?
                `,
                [
                    college_name,
                    address,
                    email,
                    contact_number,
                    website,
                    facebook,
                    instagram,
                    twitter,
                    linkedin,
                    logo,
                    rows[0].id
                ]
            );
        }

        res.json({ message: "College info updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating college info" });
    }
};

