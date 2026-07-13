const db = require("../config/db");

exports.getStudentAttendance = async (req, res) => {
  try {
    const email = req.user.email;

    const studentResult = await db.query(
        "SELECT sr_no, Courcecode, semoryear FROM students WHERE emailid = $1",
        [email]
    );

    const student = studentResult.rows;

    if (!student.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { sr_no, Courcecode, semoryear } = student[0];

    const attendanceResult = await db.query(
        `
      SELECT
        s.subjectcode,
        s.subjectname AS subject,
        COUNT(a.student_id) AS total_classes,
        COALESCE(SUM(a.present), 0) AS attended_classes,
        ROUND(
          COALESCE(
            (SUM(a.present)::numeric / NULLIF(COUNT(a.student_id), 0)) * 100,
            0
          ),
          2
        ) AS percentage
      FROM subject s
      LEFT JOIN attendance a
        ON s.subjectcode = a.subjectcode
        AND a.student_id = $1
        AND a.courcecode = $2
        AND a.semoryear = $3
      WHERE s.Courcecode = $4  
        AND s.semoryear = $5
      GROUP BY s.subjectcode, s.subjectname   
      `,
        [sr_no, Courcecode, semoryear, Courcecode, semoryear]
    );

    res.json(attendanceResult.rows);

  } catch (error) {
    console.error("ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Error loading attendance" });
  }
};