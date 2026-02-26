const db = require("../config/db");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

/*
  Get Admin Profile
*/
const adminUploadDir = path.resolve(__dirname, "../../uploads/admin");

const getAdminLogo = () => {
    if (!fs.existsSync(adminUploadDir)) return "default.png";

    const files = fs.readdirSync(adminUploadDir);

    const match = files.find(file => {
        const name = path.basename(file, path.extname(file));
        return name === "admin";
    });

    return match || "default.png";
};

exports.getAdminProfile = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM admin LIMIT 1");

        if (rows.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const admin = rows[0];

        const logoFile = getAdminLogo();
        admin.logo = `/uploads/admin/${logoFile}?v=${Date.now()}`;

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

        if (req.file) {
            if (!fs.existsSync(adminUploadDir)) {
                fs.mkdirSync(adminUploadDir, { recursive: true });
            }

            const ext = path.extname(req.file.originalname).toLowerCase();
            const allowedExt = [".png", ".jpg", ".jpeg"];

            if (!allowedExt.includes(ext)) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ message: "Only PNG, JPG, JPEG allowed" });
            }

            // Remove existing admin image
            const files = fs.readdirSync(adminUploadDir);
            files.forEach(file => {
                const name = path.basename(file, path.extname(file));
                if (name === "admin") {
                    fs.unlinkSync(path.join(adminUploadDir, file));
                }
            });

            const newFileName = `admin${ext}`;
            const newFilePath = path.join(adminUploadDir, newFileName);

            fs.renameSync(req.file.path, newFilePath);
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
                    password = COALESCE(?, password)
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
                hashedPassword
            ]
        );

        res.json({ message: "Admin updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Update failed" });
    }
};