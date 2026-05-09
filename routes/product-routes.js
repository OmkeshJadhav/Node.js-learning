const express = require('express')
const { InsertSampleData, getAllProducts } = require('../controllers/product-controller')

const router = express.Router()

router.post('/add', InsertSampleData)
router.get('/', getAllProducts)

module.exports = router