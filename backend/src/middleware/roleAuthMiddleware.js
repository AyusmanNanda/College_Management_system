const jwt = require("jsonwebtoken");

const roleAuth = (allowedRoles = []) => {

    return (req, res, next) => {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        try {

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            req.user = decoded;
            req.admin = decoded;

            if (
                allowedRoles.length > 0 &&
                !allowedRoles.includes(decoded.role)
            ) {
                return res.status(403).json({
                    message: "Forbidden: You do not have permission"
                });
            }

            next();

        } catch (error) {

            console.error("JWT Error:", error.message);

            return res.status(401).json({
                message: "Invalid token"
            });

        }

    };

};

module.exports = roleAuth;