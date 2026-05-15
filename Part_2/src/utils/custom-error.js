class CustomError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.name = 'API Error'  // set the error type to API Error

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = CustomError