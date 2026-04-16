const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {

    try {
        const authHeader = req.headers["authorization"]
        // console.log(authHeader)
        const token = authHeader && authHeader.split(" ")[1]

        if(!token){
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
        return res.status(500).json({
            success: false,
            message: `Access denied: Invalid token. Please login to access.`
        })
    }

}

module.exports = authMiddleware;