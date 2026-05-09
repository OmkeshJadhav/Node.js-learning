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

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()

        if (products.length < 1) {
            return res.status(404).json({
                success: false,
                message: `Products not found`
            })
        }

        res.status(200).json({
            success: true,
            data: products
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong!'
        })
    }
}

const productsAggregation = async (req, res) => {
    const { category, price, inStock } = req.query
    console.log(category, price)

    try {
        const productResult = await Product.aggregate([
            {
                $match: {
                    category: category,
                    price: {
                        $gte: Number(price)
                    }
                }
            },
            {
                $group: {
                    _id: "$category",
                    avgPrice: {
                        $avg: "$price"
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
        ])

        if (productResult.length === 0) {
            res.status(404).json({
                success: true,
                message: `No product found.`
            })
        } else {
            console.log(productResult)
            res.status(200).json({
                success: true,
                message: productResult
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong!'
        })
    }
}

const productAggregation2 = async (req, res) => {
    try {
        const productResult = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$price"
                    },
                    avgProductPrice: {
                        $avg: "$price"
                    },
                    maxProductPrice: {
                        $max: "$price"
                    },
                    minProductPrice: {
                        $min: "$price"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRevenue: 1,
                    avgProductPrice: 1,
                    maxProductPrice: 1,
                    minProductPrice: 1,
                    priceRange: {
                        $subtract: ["$maxProductPrice", "$minProductPrice"]
                    }
                }
            }
        ])

        res.status(200).json({
            success: true,
            data: productResult
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong!'
        })
    }
}


module.exports = {
    InsertSampleData,
    getAllProducts,
    productsAggregation,
    productAggregation2
}