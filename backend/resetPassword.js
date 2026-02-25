require("dotenv").config();

const bcrypt = require("bcrypt");
const db = require("./src/config/db");
const readline = require("readline");

const tableMap = {
    1: { name: "admin", table: "admin" },
    2: { name: "faculty", table: "faculties" },
    3: { name: "student", table: "students" }
};

function ask(question, hide = false) {
    if (!hide) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
    }

    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    return new Promise((resolve) => {
        let input = "";

        process.stdin.on("data", (char) => {
            char = char.toString();

            if (char === "\n" || char === "\r" || char === "\u0004") {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdout.write("\n");
                resolve(input);
            } else if (char === "\u0003") {
                process.exit();
            } else {
                input += char;
            }
        });
    });
}

(async () => {
    try {
        console.log("\nSelect user type:");
        console.log("1. Admin");
        console.log("2. Faculty");
        console.log("3. Student\n");

        const option = await ask("Enter option (1-3): ");

        if (!tableMap[option]) {
            console.log("Invalid option selected.");
            process.exit(1);
        }

        const { name, table } = tableMap[option];

        const email = await ask(`Enter ${name} email: `);
        const password = await ask("Enter new password: ", true);
        const confirm = await ask("Retype new password: ", true);

        if (!email || !password) {
            console.log("Email and password are required.");
            process.exit(1);
        }

        if (password !== confirm) {
            console.log("Passwords do not match.");
            process.exit(1);
        }

        const hashed = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `UPDATE ${table} SET password = ? WHERE emailid = ?`,
            [hashed, email]
        );

        if (result.affectedRows === 0) {
            console.log(`No ${name} found with that email.`);
        } else {
            console.log(`${name} password updated successfully.`);
        }

        process.exit(0);

    } catch (error) {
        console.error("Error updating password:", error);
        process.exit(1);
    }
})();