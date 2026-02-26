//Get Student Profile

exports.getStudentProfile = async (req, res) => {
  try {
    const userid = req.user.userid;

    const [rows] = await db.query(
      "SELECT * FROM students WHERE userid = ?",
      [userid]
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
    
    
