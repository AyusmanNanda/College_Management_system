const db = require("../config/db");

exports.getStudentMarks = async (req, res) => {

  try {

    const email = req.user.email;

    // optional filters from frontend
    const { sem, subject } = req.query;

    const [student] = await db.query(
      "SELECT rollnumber, Courcecode FROM students WHERE emailid = ?",
      [email]
    );

    if (!student.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { rollnumber, Courcecode } = student[0];

    // dynamic query
    let query = `
      SELECT
        subjectname,
        subjectcode,
        semoryear,
        theorymarks,
        practicalmarks,
        (theorymarks + practicalmarks) AS total_marks
      FROM marks
      WHERE rollnumber = ?
      AND Courcecode = ?
    `;

    const params = [rollnumber, Courcecode];

    if (sem) {
      query += " AND semoryear = ?";
      params.push(sem);
    }

    if (subject) {
      query += " AND subjectcode = ?";
      params.push(subject);
    }

    const [rows] = await db.query(query, params);

    res.json({
      marks: rows,
      course: Courcecode,
      roll: rollnumber
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }

};
