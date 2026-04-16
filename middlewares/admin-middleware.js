const adminMiddleware = (req, res, next) => {
    try {
        if (!req.userInfo) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access"
            })
        }

        const { userId, username, role } = req.userInfo
        
        if (role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: `Access denied! Please log in as Admin to access.`
            })
        } else {
            console.log(`Logged in as ${role}`)
        }
        next()
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || `Internal server error`
        })
    }
}

module.exports = adminMiddleware