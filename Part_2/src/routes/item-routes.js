const express = require('express')
const { getItem, createItem } = require('../controller/item-controller.js')

const router = express.Router()

router.get('/', getItem)
router.post('/', createItem)

module.exports = router;