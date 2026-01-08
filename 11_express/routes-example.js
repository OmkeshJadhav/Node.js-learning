// Routing in Node.js
// • Order of the routes matter a lot

// app.use() - This will match all the HTTP method API calls 
// app.get() - This will only handle GET calls


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

// req.params - To get the dynamic route (specific product) while handling dynamic route
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

    if (getRequestedProduct) {
        res.json(getRequestedProduct)
    } else {
        res.status(404).send('Product not found.')
    }
})

// req.query - To get the queries from the request parameters
app.get("/user", (req, res) => {
    console.log("GET user data");
    console.log(req.query)  // http://localhost:3000/user?name=omkesh ---> [Object: null prototype] { name: 'omkesh' }
    res.send("User data received successfully.")
})

// Advanced Routing in Node.js
// • Routing in Node.js allows you to define how the server responds to various HTTP requests. 
// • Advanced routing techniques can be used to create dynamic and flexible routes by using special characters like +, ?, *, and regular expressions.


// Special Characters in Routing
// 	1. + (Plus)
// 		• The + character matches one or more occurrences of the preceding character.
app.get('/ab+c', (req, res) => {
    res.send('Route matched: /ab+c');
});
// 		• The route /ab+c would match:
// ○ /abc
// ○ /abbc
// ○ /abbbc, and so on.


// 2. ? (Question Mark)
// 	• The ? character makes the preceding character optional in an Express route pattern.
// 	• Example:
app.get('/ab?c', (req, res) => {
    res.send('Route matched: /ab?c');
});

// • This route will match:
// 	• /abc
// 	• /ac (since b is optional).

app.get(/^\/a(bc)?d$/, (req, res) => {
    res.send({ firstName: "Omkesh", lastName: "Jadhav" });
});

// • In this route - bc is optional. So,
// □ /ad → { firstName: "Omkesh", lastName: "Jadhav" }
// □ /abcd → { firstName: "Omkesh", lastName: "Jadhav" }
// □ /abc or /ab → 404 (not matched)
// □ express v5 onwards "a(bc)?c" regex is not supported so we need to write actual regex


// 3. * (Asterisk)
// 	• The * character matches any sequence of characters in an Express route. i.e. anything in place of * will work
// 	• Example:
app.get('/a*cd', (req, res) => {
    res.send('Route matched: /a*cd');
});
// • This route will match:
// 	• /acd
// 	• /abcd
// 	• /axyzcd, etc.


// 4. Regular Expressions
// 	• Regular expressions (regex) can be used in Express routing to match complex patterns.
// 	• Examples:
app.get(/a/, (req, res) => {
    res.send('Route matched any path containing "a"');
});
// • This route will match:
// 	• /abc
// 	• /a123
// 	• /123a, etc.


app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
})