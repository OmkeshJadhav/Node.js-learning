const CustomError = require('../utils/custom-error')

const globalErrorHandler = (err, req, res, next) => {
    console.error(err)

    // Custom application errors
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        })
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errorMessages = Object.values(err.errors).map(
            (error) => error.message
        )

        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: errorMessages
        })
    }

    // CastError → Invalid MongoDB ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`
        })
    }

    // MongoDB Duplicate Key Error: → Example: Email already exists
    if (err.code === 11000) {
        const duplicateField = Object.keys(err.keyValue)[0]
        const duplicateValue = err.keyValue[duplicateField]

        return res.status(409).json({
            success: false,
            message: `${duplicateField} '${duplicateValue}' already exists`
        })
    }

    // JWT Invalid Token Error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        })
    }

    // JWT Expired Token Error
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        })
    }

    // Default server error
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    })
}

module.exports = globalErrorHandler