const express = require('express')
const { InsertSampleData } = require('../controllers/product-controller')

const router = express.Router()

router.post('/add', InsertSampleData)

module.exports = router