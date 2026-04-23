const db = require("../config/db");

exports.getStudentAttendance = async (req, res) => {
  try {
    const email = req.user.email;

    const [student] = await db.query(
      "SELECT sr_no, Courcecode, semoryear FROM students WHERE emailid = ?",
      [email]
    );

    if (!student.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { sr_no, Courcecode, semoryear } = student[0];

    const [rows] = await db.query(
      `
      SELECT
        s.subjectcode,
        s.subjectname AS subject,
        COUNT(a.student_id) AS total_classes,
        IFNULL(SUM(a.present), 0) AS attended_classes,
        ROUND(
          IFNULL((SUM(a.present) / NULLIF(COUNT(a.student_id), 0)) * 100, 0),
          2
        ) AS percentage
      FROM subject s
      LEFT JOIN attendance a
        ON s.subjectcode = a.subjectcode
        AND a.student_id = ?
        AND a.courcecode = ?
        AND a.semoryear = ?
      WHERE s.Courcecode = ?   -- ✅ FIXED (capital C)
        AND s.semoryear = ?
      GROUP BY s.subjectcode, s.subjectname   -- ✅ FIXED
      `,
      [sr_no, Courcecode, semoryear, Courcecode, semoryear]
    );

    res.json(rows);

  } catch (error) {
    console.error("ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Error loading attendance" });
  }
};
