const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.getDashboard = async (req, res) => {

  try {

    const email = req.user.email;

    const [rows] = await db.query(
      "SELECT firstname, lastname, rollnumber, Courcecode, semoryear, profilePic FROM students WHERE emailid=?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading dashboard" });
  }

};


exports.updatePassword = async (req, res) => {
  try {
    const email = req.user.email;
    const { password } = req.body;

    // ✅ check password exists
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // ✅ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE students SET password=? WHERE emailid=?",
      [hashedPassword, email]
    );

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Password update failed" });
  }
};


exports.updateDOB = async (req, res) => {
  try {
    const email = req.user.email;
    const { dateofbirth } = req.body;

    // ✅ check DOB exists
    if (!dateofbirth) {
      return res.status(400).json({ message: "Date of birth is required" });
    }

    await db.query(
      "UPDATE students SET dateofbirth=? WHERE emailid=?",
      [dateofbirth, email]
    );

    res.json({ message: "DOB updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "DOB update failed" });
  }
};
