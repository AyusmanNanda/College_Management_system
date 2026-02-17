const bcrypt = require("bcrypt");
const db = require("./src/config/db");

(async () => {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await db.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedPassword, "admin@college.com"]
    );

    console.log("Admin password hashed successfully");
    process.exit();
})();
