const asyncHandler = require('../middleware/asyncHandler')
const CustomError = require('../utils/custom-error')
const globalErrorHandler = require('../middleware/globalErrorHandler')

const items = [
    {
        id: 1,
        item: 'Item 1'
    },
    {
        id: 2,
        item: 'Item 2'
    },
    {
        id: 3,
        item: 'Item 3'
    },
    {
        id: 4,
        item: 'Item 4'
    },
    {
        id: 5,
        item: 'Item 5'
    }
]

const getItem = asyncHandler(async (req, res) => {
    res.json(items)
})

const createItem = asyncHandler(async (req, res) => {
    console.log(req.body);
    if (!req.body.name) {
        throw new CustomError('Item name is required', 400)
    }

    const newItem = {
        id: items.length + 1,
        name: req.body.name
    }

    items.push(newItem)

    res.status(201).json({
        success: true,
        data: newItem
    })
})

module.exports = { getItem, createItem }