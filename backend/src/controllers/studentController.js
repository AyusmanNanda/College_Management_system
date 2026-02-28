const db = require("../config/db");
const bcrypt = require("bcrypt");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

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

// Admin: Get All Students

exports.getAllStudents = async (req, res) => {
  try {
    const [rows] = await db.query(
        `SELECT * FROM students ORDER BY sr_no DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching students" });
  }
};

// Admin: Create Student

exports.createStudent = async (req, res) => {
  try {
    const {
      fullname,
      rollnumber,
      emailid,
      contactnumber,
      dateofbirth,
      gender,
      state,
      city,
      fathername,
      fatheroccupation,
      mothername,
      motheroccupation,
      userid,
      Courcecode,
      semoryear,
      optionalsubject,
      admissiondate,
      password
    } = req.body;

    if (
        !fullname ||
        !rollnumber ||
        !emailid ||
        !contactnumber ||
        !dateofbirth ||
        !gender ||
        !userid ||
        !Courcecode ||
        !semoryear
    ) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Split full name
    const nameParts = fullname.trim().split(" ");
    const firstname = nameParts[0];
    const lastname = nameParts.slice(1).join(" ") || "";

    // Check duplicate userid or email
    const [existing] = await db.query(
        `SELECT * FROM students WHERE userid = ? OR emailid = ?`,
        [userid, emailid]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "User ID or Email already exists" });
    }

    const finalPassword = password || dateofbirth;
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const profilepic = req.file ? req.file.filename : null;

    await db.query(
        `INSERT INTO students 
      (Courcecode, semoryear, rollnumber, optionalsubject, firstname, lastname, emailid,
       contactnumber, dateofbirth, gender, state, city,
       fathername, fatheroccupation, mothername, motheroccupation,
       profilepic, userid, password, activestatus, admissiondate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Courcecode,
          semoryear,
          rollnumber,
          optionalsubject || null,
          firstname,
          lastname,
          emailid,
          contactnumber,
          dateofbirth,
          gender,
          state,
          city,
          fathername || null,
          fatheroccupation || null,
          mothername || null,
          motheroccupation || null,
          profilepic,
          userid,
          hashedPassword,
          1,
          admissiondate || null
        ]
    );

    res.json({ message: "Student created successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating student" });
  }
};

// Admin: Update Student

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullname,
      rollnumber,
      emailid,
      contactnumber,
      dateofbirth,
      gender,
      state,
      city,
      fathername,
      fatheroccupation,
      mothername,
      motheroccupation,
      userid,
      Courcecode,
      semoryear,
      optionalsubject,
      admissiondate,
      password,
      activestatus
    } = req.body;

    const nameParts = fullname.trim().split(" ");
    const firstname = nameParts[0];
    const lastname = nameParts.slice(1).join(" ") || "";

    let updateQuery = `
      UPDATE students SET
      Courcecode = ?,
      semoryear = ?,
      rollnumber = ?,
      optionalsubject = ?,
      firstname = ?,
      lastname = ?,
      emailid = ?,
      contactnumber = ?,
      dateofbirth = ?,
      gender = ?,
      state = ?,
      city = ?,
      fathername = ?,
      fatheroccupation = ?,
      mothername = ?,
      motheroccupation = ?,
      userid = ?,
      admissiondate = ?,
      activestatus = ?
    `;

    const values = [
      Courcecode,
      semoryear,
      rollnumber,
      optionalsubject || null,
      firstname,
      lastname,
      emailid,
      contactnumber,
      dateofbirth,
      gender,
      state,
      city,
      fathername || null,
      fatheroccupation || null,
      mothername || null,
      motheroccupation || null,
      userid,
      admissiondate || null,
      activestatus
    ];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password = ?`;
      values.push(hashedPassword);
    }

    if (req.file) {
      updateQuery += `, profilepic = ?`;
      values.push(req.file.filename);
    }

    updateQuery += ` WHERE sr_no = ?`;
    values.push(id);

    await db.query(updateQuery, values);

    res.json({ message: "Student updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating student" });
  }
};

// Admin: Delete Student

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
        "SELECT profilepic FROM students WHERE sr_no = ?",
        [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const profilepic = rows[0].profilepic;
    const studentUploadDir = path.resolve(__dirname, "../../uploads/students");

    await db.query("DELETE FROM students WHERE sr_no = ?", [id]);

    if (profilepic && profilepic !== "default.png") {
      const filePath = path.join(studentUploadDir, profilepic);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: "Student deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting student" });
  }
};

    
    
