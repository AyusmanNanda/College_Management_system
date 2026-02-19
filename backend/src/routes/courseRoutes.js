const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const courseController = require("../controllers/courseController");

/*
  Course Routes
  -------------
  Single Admin System
*/

router.post(
    "/",
    authMiddleware,
    courseController.createCourse
);

router.get(
    "/",
    authMiddleware,
    courseController.getCourses
);

router.put(
    "/:id",
    authMiddleware,
    courseController.updateCourse
);

router.delete(
    "/:id",
    authMiddleware,
    courseController.deleteCourse
);

module.exports = router;
