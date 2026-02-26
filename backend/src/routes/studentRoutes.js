const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const studentController = require("../controllers/studentController");

/* Update Configuration */

const studentUploadPath = path.join("uploads", "students");

//Create folder if it does not exist
if (!fs.existsSync(studentUploadPath)) {
  fs.mkdirSync(studentUploadPath, { recursive: true });
}

const studentStorage = multer diskStorage({
  destination: function (req, file, cb) {
    cb(null, studentUploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = "student_" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const studentUpload = multer({
  storage: studentStorage,
  limits: { fileSize: 2 * 1024 * 1024 } //2MB limit
});

/* Student Routes */

// View Profile
router.get("/profile", authMiddleware, studentController.getStudentProfile);

// Update Profile
router.put(
  "/profile",
  authMiddleware,
  studentUpload.single("profilepic"),
  studentController.updateStudentProfile
  );

// View Subjects
router.get("/subjects", authMiddleware, studentController.getStudentSubjects);
module.exports = routers;

