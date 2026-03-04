const express = require("express");
const router = express.Router();

const marksController = require("../controllers/marksController");
const protect = require("../middleware/authMiddleware");

// Load students for marks entry
router.get("/students", protect, marksController.getStudentsForMarks);
router.get("/subjects", marksController.getSubjects);
// Save marks
router.post("/save", protect, marksController.saveMarks);

// Load marks for editing
router.get("/edit", protect, marksController.getMarksForEdit);

// Update marks
router.put("/update", protect, marksController.updateMarks);

// Delete marks for one student
router.delete("/delete", protect, marksController.deleteMarks);

// Delete all marks for a subject
router.delete("/delete-subject", protect, marksController.deleteSubjectMarks);

// Marks report
router.get("/report", protect, marksController.getMarksReport);

router.get("/subject-report", marksController.getSubjectReport);
router.get("/student-marks", marksController.getStudentMarksheet);

module.exports = router;