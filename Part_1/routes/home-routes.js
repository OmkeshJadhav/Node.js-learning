const express = require('express')
const homePage = require('../controllers/home-controller')
const authMiddleware = require('../middlewares/auth-middleware')


const router = express.Router()

router.get('/homepage', authMiddleware, homePage)

module.exports = router;