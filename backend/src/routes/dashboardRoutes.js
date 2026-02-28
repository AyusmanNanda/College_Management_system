const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
const dashboardController = require("../controllers/dashboardController");

router.get(
    "/",
    authMiddleware,
    dashboardController.getDashboardStats
);

router.get(
  "/faculty",
  authMiddleware,
  requireRole("faculty"),
  dashboardController.getFacultyDashboardStats
);

module.exports = router;


