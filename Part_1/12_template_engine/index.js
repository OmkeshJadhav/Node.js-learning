// EJS is a simple templating language that lets you generate HTML Markup with plain Javascript
// It helps to generate dynamic HTML pages in Express application

const express = require('express')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
const PORT = 3000

const app = express()

// Set view/template engine as EJS
app.set('view engine', 'ejs')

app.use(expressLayouts)

// set the directory for the views
app.set('views', path.join(__dirname, 'views'))


// Create dummy data
const products = [
    {
        id: 1,
        title: 'Product 1'
    },
    {
        id: 2,
        title: 'Product 2'
    },
    {
        id: 3,
        title: 'Product 3'
    }
]

// Home Routes
app.get('/', (req, res) => {
    res.render('pages/home.ejs', {title: 'Home', products: products})
})

// About Route
app.get('/about', (req, res) => {
    res.render('pages/about.ejs', {title: 'About Page'})
})

app.listen(PORT, () => {
    console.log(`App is listening on PORT ${PORT}`)
})