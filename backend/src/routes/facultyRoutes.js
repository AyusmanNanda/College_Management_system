const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const facultyController = require("../controllers/facultyController");
const roleAuth = require("../middleware/roleAuthMiddleware");

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
// Get logged-in faculty profile
router.get(
  "/profile",
  authMiddleware,
  facultyController.getFacultyProfile
);

// Update logged-in faculty profile
router.put(
  "/profile",
  authMiddleware,
  facultyController.uploadProfile.single("profilepic"),
  facultyController.updateFacultyProfile
);

// Change password
router.put(
  "/change-password",
  authMiddleware,
  facultyController.changeFacultyPassword
);

// Change email
router.put(
  "/change-email",
  authMiddleware,
  facultyController.changeFacultyEmail
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



router.get(
    "/dashboard",
    roleAuth(["faculty"]),
    facultyController.getFacultyDashboardStats
);

module.exports = router;