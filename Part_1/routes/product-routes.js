const express = require('express')
const { InsertSampleData, getAllProducts, productsAggregation, productAggregation2 } = require('../controllers/product-controller')

const router = express.Router()

router.post('/add', InsertSampleData)
router.get('/', getAllProducts)
router.get('/productsAggregation', productsAggregation)
router.get('/productsAggregation2', productAggregation2)

module.exports = router