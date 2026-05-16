const express = require('express')
const { getItem } = require('../controller/item-controller.js')

const router = express.Router()

router.get('/', getItem)

module.exports = router;