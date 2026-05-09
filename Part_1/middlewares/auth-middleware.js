const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {

    try {
        const authHeader = req.headers["authorization"]
        // console.log(authHeader)
        const token = authHeader && authHeader.split(" ")[1]

        if (!token) {
            return res.status(401).json({
                success: false,
                message: `Token not available. Please login to access.`
            })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        // console.log(decodedToken)

        req.userInfo = decodedToken

        next()
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            })
        }

        return res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }

}

module.exports = authMiddleware;