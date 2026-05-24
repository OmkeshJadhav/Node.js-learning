const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/refreshToken.model');

const generateToken = async (user) => {
    // Access Token
    const accessToken = jwt.sign(
        {
            userId: user._id,
            username: user.username,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
    );

    // Refresh Token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);  // Refresh Token expires in 7 days

    await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt
    })

    return { accessToken, refreshToken};
}

module.exports = generateToken;