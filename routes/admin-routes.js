const express = require('express')
const adminPage = require('../controllers/admin-controller')
const authMiddleware = require('../middlewares/auth-middleware')
const adminMiddleware = require('../middlewares/admin-middleware')

const router = express.Router()

router.get('/adminPage', authMiddleware, adminMiddleware, adminPage)

module.exports = router;