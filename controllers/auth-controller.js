const User = require('../models/user-model')
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')

// register controller
const registerUser = async (req, res) => {
    try {
        // Extract user information from the body
        const { name, username, email, password, age } = req.body

        // Check if user already exists in db
        const isExistingUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (isExistingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists! Please try with different username or email id.'
            })
        } else {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            const newUser = await User.create({
                name,
                username,
                email,
                password: hashedPassword,
                age
            })

            res.status(201).json({
                success: true,
                message: "User registered successfully.",
                data: newUser
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Some error occurred! Please try again.'
        })
    }
}


// login controller
const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body

        const user = await User.findOne({ $or: [{ email }, { username }] })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User doesn't exists.`
            })
        }

        const comparePassword = await bcrypt.compare(password, user.password)

        if (comparePassword) {
            const accessToken = jwt.sign({
                userId: user._id,
                username: user.username,
                role: user.role
            },
                process.env.JWT_SECRET_KEY,
                {
                    expiresIn: '15m'
                }
            )

            res.status(200).json({
                succeess: true,
                message: `User loggedin successfully`,
                token: accessToken,
                data: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
            })
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid credentials!'
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Some error occurred! Please try again.'
        })
    }
}

module.exports = { registerUser, loginUser }