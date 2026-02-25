const db = require("../config/db");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

/*
  Get Admin Profile
*/

exports.getAdminProfile = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM admin LIMIT 1");

        if (rows.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const admin = rows[0];

        const uploadDir = path.join(__dirname, "../../uploads/admin");
        const allowedExt = [".png", ".jpg", ".jpeg"];

        let logoPath = null;

        // Check for admin image with allowed extensions
        for (const ext of allowedExt) {
            const filePath = path.join(uploadDir, `admin${ext}`);
            if (fs.existsSync(filePath)) {
                logoPath = `/uploads/admin/admin${ext}`;
                break;
            }
        }

        // If no admin image found, use default
        if (!logoPath) {
            logoPath = "/uploads/admin/default.png";
        }

        admin.logo = logoPath;

        res.json(admin);

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

        let logoPath = null;

        if (req.file) {

            const uploadDir = path.join(__dirname, "../../uploads/admin");

            // Ensure directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const ext = path.extname(req.file.originalname).toLowerCase();
            const allowedExt = [".png", ".jpg", ".jpeg"];

            if (!allowedExt.includes(ext)) {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({ message: "Only PNG, JPG, JPEG allowed" });
            }

            // Delete existing admin image if present
            allowedExt.forEach((extension) => {
                const existingFile = path.join(uploadDir, `admin${extension}`);
                if (fs.existsSync(existingFile)) {
                    fs.unlinkSync(existingFile);
                }
            });

            const newFileName = `admin${ext}`;
            const newFilePath = path.join(uploadDir, newFileName);

            // Rename uploaded file
            fs.renameSync(req.file.path, newFilePath);

            logoPath = `/uploads/admin/${newFileName}`;
        }

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