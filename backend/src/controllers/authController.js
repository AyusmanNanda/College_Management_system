const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/*
  Admin Login
*/

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await db.query(
            "SELECT * FROM admin WHERE emailid = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const admin = rows[0];

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { email: admin.emailid },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        await db.query(
            `
            UPDATE admin 
            SET activestatus = 1,
            lastlogin = ?
            WHERE emailid = ?
            `,
            [new Date().toISOString(), email]
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

/*
  Admin Logout
*/

exports.logout = async (req, res) => {
    try {
        await db.query("UPDATE admin SET activestatus = 0");

        res.json({ message: "Logged out" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Logout failed" });
    }
};
