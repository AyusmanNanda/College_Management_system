const express = require("express");
const router = express.Router();
const assignController = require("../controllers/assignController");
const protect = require("../middleware/authMiddleware");

// Get faculties
router.get("/faculties", protect, assignController.getFaculties);

// Assign subject
router.put("/:facultyId", protect, assignController.assignSubject);

module.exports = router;