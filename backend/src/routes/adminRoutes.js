const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const authMiddleware = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

/* Multer Setup */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 }
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
