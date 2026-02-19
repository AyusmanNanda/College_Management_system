const db = require("../config/db");
const bcrypt = require("bcrypt");

/*
  Get Admin Profile
*/

exports.getAdminProfile = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM admin LIMIT 1");

        if (rows.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching admin" });
    }
};

/*
  Update Admin Profile
*/

exports.updateAdminProfile = async (req, res) => {
    try {
        const {
            collagename,
            address,
            emailid,
            contactnumber,
            website,
            facebook,
            instagram,
            twitter,
            linkedin,
            password
        } = req.body;

        let hashedPassword = null;

        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

        await db.query(
            `
                UPDATE admin
                SET collagename = ?,
                    address = ?,
                    emailid = ?,
                    contactnumber = ?,
                    website = ?,
                    facebook = ?,
                    instagram = ?,
                    twitter = ?,
                    linkedin = ?,
                    password = COALESCE(?, password),
                    logo = COALESCE(?, logo)
            `,
            [
                collagename,
                address,
                emailid,
                contactnumber,
                website,
                facebook,
                instagram,
                twitter,
                linkedin,
                hashedPassword,
                logoPath
            ]
        );

        res.json({ message: "Admin updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Update failed" });
    }
};
