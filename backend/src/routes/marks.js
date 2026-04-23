const express = require("express");
const router = express.Router();

// IMPORT THE NEW CONTROLLER WE JUST CREATED
const verifyController = require("../controllers/verifyController");

// ==========================================
// PUBLIC ROUTE (No Auth Required)
// ==========================================
// If you mount this in server.js as app.use('/api/verify', verifyRoutes)
// then the path here should just be '/marksheet/:marksheetId'
router.get("/marksheet/:marksheetId", verifyController.verifyMarksheet);

module.exports = router;