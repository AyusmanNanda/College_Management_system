require("dotenv").config();

const bcrypt = require("bcrypt");
const db = require("./src/config/db");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

(async () => {
    try {
        const email = await ask("Enter student email: ");
        const password = await ask("Enter new password: ");

        if (!email || !password) {
            console.log("Email and password are required.");
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            "UPDATE students SET password = ? WHERE emailid = ?",
            [hashedPassword, email.trim()]
        );

        if (result.affectedRows === 0) {
            console.log("No student found with that email.");
        } else {
            console.log("Student password updated successfully.");
        }

        rl.close();
        process.exit(0);

    } catch (error) {
        console.error("Error updating student password:", error);
        rl.close();
        process.exit(1);
    }
})();