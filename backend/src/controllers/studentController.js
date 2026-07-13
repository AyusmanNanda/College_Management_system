const db = require("../config/db");
const bcrypt = require("bcrypt");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");

// ============================
// Get Student Profile
// ============================

exports.getStudentProfile = async (req, res) => {
  try {
    const email = req.user.email;

    const result = await db.query(
        "SELECT * FROM students WHERE emailid = $1",
        [email]
    );

    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// ============================
// Get Student Subjects
// ============================

exports.getStudentSubjects = async (req, res) => {
  try {
    const email = req.user.email;

    const studentResult = await db.query(
        "SELECT Courcecode, semoryear FROM students WHERE emailid = $1",
        [email]
    );

    const student = studentResult.rows;

    if (student.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { Courcecode, semoryear } = student[0];

    const subjectsResult = await db.query(
        "SELECT * FROM subject WHERE courcecode = $1 AND semoryear = $2",
        [Courcecode, semoryear]
    );

    const subjects = subjectsResult.rows;

    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching subjects" });
  }
};

// ============================
// Update Student Profile
// ============================

exports.updateStudentProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const { emailid, contactnumber, state, city } = req.body;

    await db.query(
        `UPDATE students
         SET emailid = $1, contactnumber = $2, state = $3, city = $4
         WHERE emailid = $5`,
        [emailid, contactnumber, state, city, email]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};

// ============================
// Admin: Get All Students
// ============================

const studentUploadDir = path.resolve(__dirname, "../../uploads/students");

const getStudentImage = (rollnumber) => {
  if (!fs.existsSync(studentUploadDir)) return "default.png";

  const files = fs.readdirSync(studentUploadDir);

  const match = files.find((file) => {
    const name = path.basename(file, path.extname(file));
    return name.trim().toLowerCase() === String(rollnumber).trim().toLowerCase();
  });

  return match || "default.png";
};

exports.getAllStudents = async (req, res) => {
  try {
    const result = await db.query(
        `SELECT * FROM students ORDER BY sr_no DESC`
    );

    const rows = result.rows;

    const updatedStudents = rows.map((student) => ({
      ...student,
      profilepic: getStudentImage(student.rollnumber),
    }));

    res.json(updatedStudents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching students" });
  }
};

// ============================
// Admin: Create Student
// ============================

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
        !Courcecode ||
        !semoryear
    ) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const nameParts = fullname.trim().split(" ");
    const firstname = nameParts[0];
    const lastname = nameParts.slice(1).join(" ") || "";

    // Check duplicate email
    const existingResult = await db.query(
        `SELECT * FROM students WHERE emailid = $1`,
        [emailid]
    );

    const existing = existingResult.rows;

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const finalPassword = password || dateofbirth;
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const profilepic = req.file ? req.file.filename : null;

    await db.query(
        `INSERT INTO students
         (Courcecode, semoryear, rollnumber, optionalsubject, firstname, lastname, emailid,
          contactnumber, dateofbirth, gender, state, city,
          fathername, fatheroccupation, mothername, motheroccupation,
          profilepic, password, activestatus, admissiondate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                 $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
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
          hashedPassword,
          0,
          admissiondate || null
        ]
    );

    res.json({ message: "Student created successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating student" });
  }
};

// ============================
// Admin: Update Student
// ============================

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
                        Courcecode = $1,
                        semoryear = $2,
                        rollnumber = $3,
                        optionalsubject = $4,
                        firstname = $5,
                        lastname = $6,
                        emailid = $7,
                        contactnumber = $8,
                        dateofbirth = $9,
                        gender = $10,
                        state = $11,
                        city = $12,
                        fathername = $13,
                        fatheroccupation = $14,
                        mothername = $15,
                        motheroccupation = $16,
                        admissiondate = $17,
                        activestatus = $18
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
      admissiondate || null,
      activestatus
    ];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      values.push(hashedPassword);
      updateQuery += `, password = $${values.length}`;
    }

    if (req.file) {
      values.push(req.file.filename);
      updateQuery += `, profilepic = $${values.length}`;
    }

    values.push(id);
    updateQuery += ` WHERE sr_no = $${values.length}`;

    await db.query(updateQuery, values);

    res.json({ message: "Student updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating student" });
  }
};

// ============================
// Admin: Delete Student
// ============================

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
        "SELECT rollnumber FROM students WHERE sr_no = $1",
        [id]
    );

    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const rollnumber = rows[0].rollnumber;

    await db.query(
        "DELETE FROM students WHERE sr_no = $1",
        [id]
    );

    const dynamicImage = getStudentImage(rollnumber);

    if (dynamicImage !== "default.png") {
      const filePath = path.join(studentUploadDir, dynamicImage);

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

// ============================
// Download Student Template
// ============================

exports.downloadStudentTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Students");

    const headers = [
      "fullname",
      "rollnumber",
      "emailid",
      "contactnumber",
      "dateofbirth",
      "gender",
      "state",
      "city",
      "fathername",
      "fatheroccupation",
      "mothername",
      "motheroccupation",
      "Courcecode",
      "semoryear",
      "optionalsubject",
      "admissiondate"
    ];

    sheet.addRow(headers);

    sheet.columns.forEach(col => {
      col.width = 22;
    });

    sheet.getRow(1).font = { bold: true };

    sheet.addRow([
      "Rahul Kumar",
      "23011001",
      "rahul@example.com",
      "9876543210",
      "2003-01-01",
      "Male",
      "Odisha",
      "Bhubaneswar",
      "",
      "",
      "",
      "",
      "BCA",
      1,
      "",
      ""
    ]);

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=Student_Import_Template.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating template" });
  }
};

// ============================
// Import Students From Excel
// ============================

exports.importStudentsFromExcel = async (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = req.file.path;

  let totalRows = 0;
  let inserted = 0;
  let duplicates = 0;
  let invalidRows = 0;

  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    totalRows = data.length;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

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
        Courcecode,
        semoryear,
        optionalsubject,
        admissiondate
      } = row;

      if (!fullname || !rollnumber || !emailid || !Courcecode || !semoryear) {
        invalidRows++;
        continue;
      }

      try {
        const nameParts = fullname.trim().split(" ");
        const firstname = nameParts[0];
        const lastname = nameParts.slice(1).join(" ") || "";

        const hashedPassword = await bcrypt.hash(dateofbirth, 10);

        await db.query(
            `INSERT INTO students
             (Courcecode, semoryear, rollnumber, optionalsubject, firstname, lastname, emailid,
              contactnumber, dateofbirth, gender, state, city,
              fathername, fatheroccupation, mothername, motheroccupation,
              password, activestatus, admissiondate)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                     $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
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
              hashedPassword,
              1,
              admissiondate || null
            ]
        );

        inserted++;

      } catch (error) {
        if (error.code === "23505") {
          duplicates++;
        } else {
          invalidRows++;
        }
      }
    }

    fs.unlinkSync(filePath);

    res.json({
      totalRows,
      inserted,
      duplicates,
      invalidRows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Import failed" });
  }
};