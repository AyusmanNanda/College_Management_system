const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const studentController = require("../controllers/studentController");

/* Update Configuration */

const studentUploadPath = path.resolve(__dirname, "../../uploads/students");

//Create folder if it does not exist
if (!fs.existsSync(studentUploadPath)) {
  fs.mkdirSync(studentUploadPath, { recursive: true });
}

const studentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, studentUploadPath);
  },
  filename: function (req, file, cb) {
    const rollnumber = req.body.rollnumber;
    const ext = path.extname(file.originalname).toLowerCase();

    if (!rollnumber) {
      return cb(new Error("Roll number required for image naming"));
    }

    const files = fs.readdirSync(studentUploadPath);

    files.forEach(existingFile => {
      const name = path.basename(existingFile, path.extname(existingFile));
      if (name === String(rollnumber)) {
        fs.unlinkSync(path.join(studentUploadPath, existingFile));
      }
    });

    cb(null, `${rollnumber}${ext}`);
  }
});

const studentUpload = multer({
  storage: studentStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG and PNG images are allowed"));
    }
    cb(null, true);
  }
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


// Admin Routes

router.get("/", authMiddleware, studentController.getAllStudents);

router.post(
    "/",
    authMiddleware,
    studentUpload.single("profilepic"),
    studentController.createStudent
);

router.put(
    "/:id",
    authMiddleware,
    studentUpload.single("profilepic"),
    studentController.updateStudent
);

router.delete(
    "/:id",
    authMiddleware,
    studentController.deleteStudent
);


module.exports = router;

