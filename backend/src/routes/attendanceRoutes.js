const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const attendanceController = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExt = [".xlsx", ".xls"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExt.includes(ext)) {
    return cb(new Error("Only Excel files are allowed"));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
});

router.get("/students", attendanceController.getStudents);
router.get("/", attendanceController.getAttendanceByDate);
router.get("/dates", attendanceController.getAttendanceDates);
router.post("/", authMiddleware, attendanceController.saveAttendance);
router.delete("/", attendanceController.deleteAttendance);
router.get("/report", attendanceController.getReport);

router.post("/import", authMiddleware, upload.single("file"), attendanceController.importAttendance);

router.get("/template", authMiddleware, attendanceController.downloadAttendanceTemplate);

module.exports = router;