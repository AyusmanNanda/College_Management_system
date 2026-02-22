const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const courseController = require("../controllers/courseController");

/*
  Course Routes
  -------------
  Admin CRUD Operations
*/

/* -------- Create Course -------- */
router.post(
    "/",
    authMiddleware,
    courseController.createCourse
);

/* -------- Get All Courses -------- */
router.get(
    "/",
    authMiddleware,
    courseController.getCourses
);

/* -------- Update Course -------- */
router.put(
    "/:id",
    authMiddleware,
    courseController.updateCourse
);

/* -------- Delete Course -------- */
router.delete(
    "/:id",
    authMiddleware,
    courseController.deleteCourse
);

module.exports = router;