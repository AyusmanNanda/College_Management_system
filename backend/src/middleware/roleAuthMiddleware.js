const jwt = require("jsonwebtoken");

const roleAuth = (allowedRoles = []) => {

    return (req, res, next) => {

        // 1. Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        // 2. Extract token
        const token = authHeader.split(" ")[1];

        try {

            // 3. Verify token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            console.log("Decoded token:", decoded);

            //  IMPORTANT: attach decoded user to request
            req.user = decoded;

            // optional (for admin compatibility)
            req.admin = decoded;

            // 4. Check role if required
            if (
                allowedRoles.length > 0 &&
                !allowedRoles.includes(decoded.role)
            ) {
                return res.status(403).json({
                    message: "Forbidden: You do not have permission"
                });
            }

            // 5. Continue
            next();

        }
        catch (error) {

            console.error("JWT Error:", error.message);

            return res.status(401).json({
                message: "Invalid token"
            });

        }

    };

};

module.exports = roleAuth;