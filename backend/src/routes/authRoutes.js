const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/google", authController.googleLogin);
router.get("/google-redirect", authController.googleRedirect);
router.get("/google-callback", authController.googleCallback);
router.get("/session", (req, res) => {

    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    res.json({ token });

});

module.exports = router;
