const User = require('../models/user.models')
const RefreshToken = require('../models/refreshToken.model')
const generateToken = require('../utils/generate-token')
const logger = require('../utils/logger')
const { validateRegistration, validateLogin } = require('../utils/validate')


// User registration

const registerUser = async (req, res) => {
    logger.info('Registration endpoint hit');
    try {
        const { error } = validateRegistration(req.body);

        if (error) {
            logger.warn('Validation Error', error.details[0].message)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        };

        const { username, email, password } = req.body

        let user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            logger.warn('User Already Exists')
            return res.status(400).json({
                success: false,
                message: 'User Already Exists'
            });
        };

        user = new User({ username, email, password });
        await user.save();

        logger.info('User saved successfully', user._id);

        const { accessToken, refreshToken } = await generateToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully !',
            accessToken,
            refreshToken,
        });
    } catch (error) {
        logger.error('Registration Error Occurred', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server error'
        });
    }
}

// User login: validate schema -> find user -> validate password -> generate tokens
const loginUser = async (req, res) => {
    try {
        const validateSchema = validateLogin(req.body)

        if (!validateSchema) {
            logger.info('Invalid login payload.')
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials.'
            })
        }

        const { email, username, password } = req.body;

        const user = await User.findOne({ $or: [{ email }, { username }] })

        if (!user) {
            logger.info('User not found')
            return res.status(401).json({
                success: false,
                message: 'User not found!'
            })
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password)

        if (!isPasswordValid) {
            logger.info('Invalid credentials')

            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Generate tokens
        const { accessToken, refreshToken } = await generateToken(user)

        // Store refresh token securely
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })  // Always set refresh token as httpOnly cookie

        // Send response
        res.status(200).json({
            success: true,
            userId: user._id,
            username: user.username,
            email: user.email,
            accessToken,
        })

    } catch (error) {
        logger.error('Login Error Occurred', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server error'
        });
    }
}

// Refresh token
const refreshTokenController = async (req, res) => {
    logger.info('Refresh token endpoint hit...')
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            logger.warn('Refresh token missing!')
            return res.status(400).json({
                success: false,
                message: 'Refresh token missing!'
            })
        }

        // Get refresh token stored in db
        const storedRefreshToken = await User.findOne({ _id: storedRefreshToken.user })

        if (!storedRefreshToken || storedRefreshToken.expiresAt < new Date()) {
            logger.info('Invalid or expired refresh token!')
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token!'
            })
        }

        // Find user using refresh token stored in db
        const user = await User.findOne(storedRefreshToken.user)

        if (!user) {
            logger.warn('User not found!')
            return res.status(401).json({
                success: false,
                message: 'User not found!'
            })
        }

        // Generate/Rotate Token
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateToken(user)

        // delete existing token from db
        if (storedRefreshToken) {
            await RefreshToken.deleteOne({ _id: storedRefreshToken._id })
        }

        // Store refresh token securely
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // Send Response
        res.status(200).json({
            accessToken: newAccessToken,
        })
    } catch (error) {
        logger.error('Refresh Token Error Occurred', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server error'
        });
    }
}

// logout

module.exports = {
    registerUser,
    loginUser,
    refreshTokenController
};