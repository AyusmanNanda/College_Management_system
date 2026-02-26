const db = require("../config/db");

//Get Student Profile

exports.getStudentProfile = async (req, res) => {
  try {
    const email = req.user.email;

    const [rows] = await db.query(
      "SELECT * FROM students WHERE emailid = ?",
      [email]
      );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

//Get Student Subjects

exports.getStudentSubjects = async (req, res) => {
  try {
    const userid = req.user.email;

    const [student] = await db.query(
      "SELECT Courcecode, semoryear FROM students WHERE emailid = ?",
      [email]
      );

    if (student.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { Courcecode, semoryear } = student[0];

    const [subjects] = await db.query(
      "SELECT * FROM subject WHERE courcecode = ? AND semoryear = ?",
      [Courcecode, semoryear]
      );

    res.json(subjects);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching subjects" });
  }
};

// Update Student Profile

exports.updateStudentProfile = async (req, res) => {
  try {
    const userid = req.user.email;
    const { emailid, contactnumber, state, city } = req.body;

    await db.query(
      `UPDATE students
      SET emailid = ?, contactnumber = ?, state = ?, city = ?
      WHERE emailid = ?`,
      [emailid, contactnumber, state, city, userid]
      );
    
    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

    
    
