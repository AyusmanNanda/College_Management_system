const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

/* Multer Setup */

const uploadDir = "uploads/admin";

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Temporary filename — controller will rename to admin.<ext>
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 } // 1MB limit
});

/* Routes */

router.get(
    "/profile",
    authMiddleware,
    adminController.getAdminProfile
);

router.put(
    "/profile",
    authMiddleware,
    upload.single("logo"),
    adminController.updateAdminProfile
);

module.exports = router;