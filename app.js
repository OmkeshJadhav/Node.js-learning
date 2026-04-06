const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const books = [
    {
        id: "1",
        title: "Book 1",
        writer: "Writer 1",
        description: "Description of book 1"
    },
    {
        id: "2",
        title: "Book 2",
        writer: "Writer 2",
        description: "Description of book 2"
    },
    {
        id: "3",
        title: "Book 3",
        writer: "Writer 3",
        description: "Description of book 3"
    },
]

app.get('/', (_, res) => {
    res.json({
        message: "Welcome to our bookstore API."
    })
})

app.get('/get-all-books', (req, res) => {
    res.json(books)
})

app.get('/get-book/:id', (req, res) => {

    console.log(typeof(req.params.id))
    const book = books.find(item => item.id === req.params.id)

    if (book) {
        res.status(200).json(book)
    } else {
        res.status(404).json({
            message: "Book not found! Please try a different book"
        })
    }


})

app.post('/add-new-book', (req, res) => {
    const newBook = [
        {
            id: Math.floor(Math.random() * 1000).toString(),
            title: `Book ${books.length + 1}`,
            writer: `Writer ${books.length + 1}`,
            description: `Description of book ${books.length + 1}`
        }
    ]

    books.push(...newBook)

    res.status(200).json({
        data: newBook,
        message: `Book "${newBook[0].title}" is successfully added.`
    })
})

app.put('/update-book/:id', (req, res) => {
    const findBook = books.find(book => book.id === req.params.id)
    

    if (findBook) {
        findBook.title = req.body.title || findBook.title
        res.status(200).json({
            message: `Book with ID ${req.params.id} updated successfully.`,
            data: findBook
        })
    } else {
        res.status(404).json({
            message: "Book not found"
        })
    }

})

app.delete('/delete-book/:id', (req, res) => {
    const findBook = books.findIndex(book => book.id === req.params.id)

    if (findBook !== -1) {
        const deletedBook = books.splice(findBook, 1)

        res.status(200).json({
            message: "Book deleted successfully!",
            data: deletedBook[0]
        })
    } else {
        res.status(404).json({
            message: "Book not found"
        })
    }
})

app.listen(PORT, (req, res) => {
    console.log(`App is listening on PORT ${PORT}`)
})