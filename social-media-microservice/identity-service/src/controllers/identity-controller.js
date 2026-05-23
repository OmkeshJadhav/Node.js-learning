const User = require('../models/user.models')
const logger = require('../utils/logger')
const { validateRegistration } = require('../utils/validate')

// User registration

const registerUser = async (req, res) => {
    logger.info('Registration endpoint hit')
    try {
        const { error } = validateRegistration(req.body)

        if (error) {
            logger.warn('Validation Error', error.details[0].message)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }

        const {username, email, password} = req.body

        let user = await User.findOne({$or : [{email}, {username}]})

        if(user){
            logger.warn('User Already Exists')
            return res.status(400).json({
                success: false,
                message: 'User Already Exists'
            })
        }

        user = new User({username, email, password})
        await user.save()

        logger.info('User saved successfully', user._id)
    } catch (error) {
        logger.error('error', error)
    }
}

// User login

// Refresh token

// logout