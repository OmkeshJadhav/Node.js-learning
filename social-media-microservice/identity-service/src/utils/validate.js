const Joi = require('Joi')

const validateRegistration = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    })

    return schema.validate(data)
}

const validateLogin = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30),
        email: Joi.string().email(),
        password: Joi.string().min(6).required()
    })

    return schema.validate(data)
}

module.exports = {
    validateRegistration,
    validateLogin
}
