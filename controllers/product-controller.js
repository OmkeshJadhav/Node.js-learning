const Product = require("../models/product-model")

const InsertSampleData = async (req, res) => {
    try {
        const sampleProducts = [
            {
                name: "Laptop",
                category: "Electronics",
                price: 50000,
                inStock: true,
                tags: ['computer', 'tech']
            },
            {
                name: "Smartphone",
                category: "Electronics",
                price: 25000,
                inStock: true,
                tags: ["mobile", 'tech']
            },
            {
                name: "Running Shoes",
                category: "Sports",
                price: 3500,
                inStock: true,
                tags: ['footwear', 'running']
            },
            {
                name: "Headphones",
                category: "Electronics",
                price: 2000,
                inStock: false,
                tags: ['audio', 'tech']
            },
            {
                name: "Novel",
                category: "Books",
                price: 150,
                inStock: true,
                tags: ['fiction', 'bestseller']
            }
        ]

        const result = await Product.insertMany(sampleProducts)

        res.status(200).json({
            success: true,
            data: `Inserted ${result.length} sample products.`
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong!'
        })
    }
}

module.exports = {
    InsertSampleData
}