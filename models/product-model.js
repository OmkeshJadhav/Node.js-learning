const mongoose = require("mongoos")

const ProductSchema = new mongoose.schema({
    name: String,
    category: String,
    price: Number,
    inStock: Boolean,
    tags: [String]
})

module.exports = mongoose.model('Product', ProductSchema)