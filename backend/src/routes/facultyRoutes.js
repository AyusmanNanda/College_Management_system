const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const facultyController = require("../controllers/facultyController");

/*
  Faculty Routes
  --------------
  Admin CRUD Operations
*/

// Create faculty with image upload
router.post(
    "/",
    authMiddleware,
    facultyController.upload.single("profilepic"),
    facultyController.createFaculty
);

// Get all faculties
router.get(
    "/",
    authMiddleware,
    facultyController.getFaculties
);

// Update faculty with optional image update
router.put(
    "/:id",
    authMiddleware,
    facultyController.upload.single("profilepic"),
    facultyController.updateFaculty
);

// Delete faculty
router.delete(
    "/:id",
    authMiddleware,
    facultyController.deleteFaculty
);

router.get(
    "/template",
    authMiddleware,
    facultyController.downloadFacultyTemplate
);

router.post(
    "/import",
    authMiddleware,
    facultyController.uploadExcel.single("file"),
    facultyController.importFacultiesFromExcel
);

module.exports = router;