require("dotenv").config();   // 🔥 ADD THIS

const bcrypt = require("bcrypt");
const db = require("./src/config/db");

(async () => {
    try {
        const hashedPassword = await bcrypt.hash("admin123", 10);

        await db.query(
            "UPDATE admin SET password = ? WHERE emailid = ?",
            [hashedPassword, "admin@gcekjr.ac.in"]
        );

        console.log("Admin password hashed successfully");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
