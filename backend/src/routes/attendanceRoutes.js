const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

router.get("/students", attendanceController.getStudents);
router.post("/", attendanceController.saveAttendance);
router.get("/report", attendanceController.getReport);

module.exports = router;