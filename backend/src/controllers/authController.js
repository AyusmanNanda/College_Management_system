const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/*
  Role-Based Login
  Supports bcrypt OR plain text passwords
*/

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = null;
        let role = null;
        let table = null;

        // Check admin
        const [adminRows] = await db.query(
            "SELECT * FROM admin WHERE emailid = ?",
            [email]
        );

        if (adminRows.length > 0) {
            user = adminRows[0];
            role = "admin";
            table = "admin";
        }

        // Check faculties
        if (!user) {
            const [facultyRows] = await db.query(
                "SELECT * FROM faculties WHERE emailid = ?",
                [email]
            );

            if (facultyRows.length > 0) {
                user = facultyRows[0];
                role = "faculty";
                table = "faculties";
            }
        }

        // Check students
        if (!user) {
            const [studentRows] = await db.query(
                "SELECT * FROM students WHERE emailid = ?",
                [email]
            );

            if (studentRows.length > 0) {
                user = studentRows[0];
                role = "student";
                table = "students";
            }
        }

        // No user found
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check password (bcrypt OR plain text)
        let isMatch = false;

        if (user.password.startsWith("$2")) {
            // bcrypt hash
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // plain text fallback
            isMatch = password === user.password;
        }

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { email: user.emailid, role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        await db.query(
            `
                UPDATE ${table}
                SET activestatus = 1,
                    lastlogin = ?
                WHERE emailid = ?
            `,
            [new Date().toISOString(), email]
        );

        res.json({
            message: "Login successful",
            token,
            role
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


/*
  Role-Based Logout
*/

exports.logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { email, role } = decoded;

        let table = null;

        if (role === "admin") table = "admin";
        if (role === "faculty") table = "faculties";
        if (role === "student") table = "students";

        if (!table) {
            return res.status(400).json({ message: "Invalid role" });
        }

        await db.query(
            `
                UPDATE ${table}
                SET activestatus = 0
                WHERE emailid = ?
            `,
            [email]
        );

        res.json({ message: "Logged out successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Logout failed" });
    }
};