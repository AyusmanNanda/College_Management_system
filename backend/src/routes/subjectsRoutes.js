const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");
const { protect } = require("../middleware/authMiddleware");

// Create subject
router.post("/", protect, subjectController.createSubject);

// Get subjects by course + semester
router.get("/", protect, subjectController.getSubjects);

// Update subject
router.put("/:subjectcode", protect, subjectController.updateSubject);

// Delete subject
router.delete("/:subjectcode", protect, subjectController.deleteSubject);

module.exports = router;