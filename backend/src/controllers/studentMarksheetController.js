const db = require("../config/db");

exports.getStudentMarks = async (req, res) => {

  try {

    const email = req.user.email;

    // optional filters from frontend
    const { sem, subject } = req.query;

    const studentResult = await db.query(
        "SELECT rollnumber, Courcecode FROM students WHERE emailid = $1",
        [email]
    );

    const student = studentResult.rows;

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
      WHERE rollnumber = $1
        AND Courcecode = $2
    `;

    const params = [rollnumber, Courcecode];

    if (sem) {
      params.push(sem);
      query += ` AND semoryear = $${params.length}`;
    }

    if (subject) {
      params.push(subject);
      query += ` AND subjectcode = $${params.length}`;
    }

    const result = await db.query(query, params);

    const rows = result.rows;

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