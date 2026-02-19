const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const courseController = require("../controllers/courseController");

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    courseController.createCourse
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    courseController.getCourses
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    courseController.updateCourse
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    courseController.deleteCourse
);

module.exports = router;
