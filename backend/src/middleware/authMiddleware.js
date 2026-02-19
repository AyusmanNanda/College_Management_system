const jwt = require("jsonwebtoken");

/*
  Simple Admin Auth Middleware
*/

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.admin = decoded; // attach decoded email

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
