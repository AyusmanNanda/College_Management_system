const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const facultyController = require("../controllers/facultyController");

/*
  Faculty Routes
  --------------
  Admin CRUD Operations
*/

// Create faculty
router.post("/", authMiddleware, facultyController.createFaculty);

// Get all faculties
router.get("/", authMiddleware, facultyController.getFaculties);

// Update faculty
router.put("/:id", authMiddleware, facultyController.updateFaculty);

// Delete faculty
router.delete("/:id", authMiddleware, facultyController.deleteFaculty);

module.exports = router;