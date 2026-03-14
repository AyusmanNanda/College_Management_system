const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/google", authController.googleLogin);

module.exports = router;
