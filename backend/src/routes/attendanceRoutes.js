const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

router.get("/students", attendanceController.getStudents);
router.get("/", attendanceController.getAttendanceByDate);
router.get("/dates", attendanceController.getAttendanceDates);
router.post("/", attendanceController.saveAttendance);
router.delete("/", attendanceController.deleteAttendance);
router.get("/report", attendanceController.getReport);

module.exports = router;