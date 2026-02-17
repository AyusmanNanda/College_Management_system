const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const adminController = require("../controllers/adminController");


router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("admin"),
    (req, res) => {
        res.json({
            message: "Welcome Admin",
            user: req.user
        });
    }
);

router.post(
    "/create-faculty",
    authMiddleware,
    roleMiddleware("admin"),
    adminController.createFaculty
);

router.get(
    "/faculties",
    authMiddleware,
    roleMiddleware("admin"),
    adminController.getAllFaculties
);

router.put(
    "/faculty/:id",
    authMiddleware,
    roleMiddleware("admin"),
    adminController.updateFaculty
);



module.exports = router;
