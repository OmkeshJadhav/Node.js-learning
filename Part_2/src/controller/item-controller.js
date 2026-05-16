const asyncHandler = require('../middleware/asyncHandler')

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

const getItem = asyncHandler(async(req, res) => {
    res.json(items)
})

module.exports = {getItem}