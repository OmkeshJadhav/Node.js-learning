const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Welcome to Home page')
})

// get all products
app.get('/products', (req, res) => {
    const products = [
        {
            id: 1,
            label: 'Product 1'
        },
        {
            id: 2,
            label: 'Product 2'
        },
        {
            id: 3,
            label: 'Product 3'
        },
    ]

    res.json(products)
})

// get only a specific product
app.get('/product/:prodId', (req, res) => {
    const productId = parseInt(req.params.prodId)    

    const products = [
        {
            id: 1,
            label: 'Product 1'
        },
        {
            id: 2,
            label: 'Product 2'
        },
        {
            id: 3,
            label: 'Product 3'
        },
    ]

    const getRequestedProduct = products.find(product => product.id === productId) 
    
    if(getRequestedProduct){
        res.json(getRequestedProduct)
    } else {
        res.status(404).send('Product not found.')
    }
})


app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
})