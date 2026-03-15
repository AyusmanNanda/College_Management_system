const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL}/api/auth/google-callback`
);
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

exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const email = payload.email;

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

        // Check faculty
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

        if (!user) {
            return res.status(403).json({
                message: "Google account not registered in system"
            });
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
            message: "Google login successful",
            token,
            role
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Google login failed" });
    }
};

exports.googleRedirect = (req, res) => {

    const redirectUri = `${process.env.BASE_URL}/api/auth/google-callback`;

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

    authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "select_account");

    // optional security parameter
    authUrl.searchParams.set("state", "google_login");

    console.log("Redirecting to Google OAuth:", authUrl.toString());

    res.redirect(authUrl.toString());
};

exports.googleCallback = async (req, res) => {

    try {

        const { code } = req.query;

        if (!code) {
            return res.status(400).send("Authorization code missing");
        }

        /* ===== Exchange authorization code for tokens ===== */

        const { tokens } = await client.getToken(code);

        /* ===== Verify Google ID token ===== */

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload.email_verified) {
            return res.status(401).send("Google email not verified");
        }

        const email = payload.email;

        let user = null;
        let role = null;
        let table = null;

        /* ===== Check Admin ===== */

        const [adminRows] = await db.query(
            "SELECT * FROM admin WHERE emailid = ?",
            [email]
        );

        if (adminRows.length > 0) {
            user = adminRows[0];
            role = "admin";
            table = "admin";
        }

        /* ===== Check Faculty ===== */

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

        /* ===== Check Student ===== */

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

        /* ===== Reject unknown Google users ===== */

        if (!user) {
            return res.status(403).send("Google account not registered in system");
        }

        /* ===== Generate JWT ===== */

        const token = jwt.sign(
            { email: user.emailid, role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        /* ===== Update login status ===== */

        await db.query(
            `
                UPDATE ${table}
                SET activestatus = 1,
                    lastlogin = ?
                WHERE emailid = ?
            `,
            [new Date().toISOString(), email]
        );

        /* ===== Redirect to frontend ===== */

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: false, // true in production with HTTPS
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.redirect(`${process.env.FRONTEND_URL}/oauth-success?role=${role}`);

    } catch (error) {

        console.error("Google OAuth Error:", error);
        res.status(500).send("Google login failed");

    }

};