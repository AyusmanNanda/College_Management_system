const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleAuth = require("../middleware/roleAuthMiddleware");
const facultyController = require("../controllers/facultyController");

/*
  Faculty Routes
  --------------
  Admin CRUD Operations
*/

router.post(
    "/",
    authMiddleware,
    facultyController.upload.single("profilepic"),
    facultyController.createFaculty
);

router.get(
    "/",
    authMiddleware,
    facultyController.getFaculties
);

router.put(
    "/:id",
    authMiddleware,
    facultyController.upload.single("profilepic"),
    facultyController.updateFaculty
);

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
    "/profile",
    roleAuth(["faculty"]),
    facultyController.getFacultySelfProfile
);

router.get(
    "/dashboard",
    roleAuth(["faculty"]),
    facultyController.getFacultyDashboardStats
);

module.exports = router;