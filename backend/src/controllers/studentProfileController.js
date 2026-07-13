const db = require("../config/db");

// UPDATE STUDENT PROFILE
exports.updateStudentProfile = async (req, res) => {

    try {

        const email = req.user.email; // from JWT token
        const { password, dob } = req.body;

        const query = `
            UPDATE students
            SET password = $1, dob = $2
            WHERE email = $3
        `;

        await db.query(query, [password, dob, email]);

        res.json({
            message: "Profile updated successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};