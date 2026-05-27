const express = require('express')
const { registerUser, loginUser, refreshTokenController } = require('../controllers/identity-controller')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/refresh-token', refreshTokenController)

module.exports = router