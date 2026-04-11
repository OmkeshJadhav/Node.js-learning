const Book = require('../models/book-model')

const getAllBooks = async (_, res) => {
    try {
        const allBooks = await Book.find()

        if (allBooks.length > 0) {
            res.status(200).json({
                success: true,
                count: allBooks.length,
                data: allBooks
            })
        } else {
            res.status(200).json({
                success: true,
                data: "No books found"
            })
        }
    } catch (error) {
        console.log('Error getting all books -> ', error)
        res.status(500).json({
            success: false,
            message: `Internal server error`
        })
    }
}

const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)

        if (!book) {
            return res.status(404).json({
                success: false,
                message: `Book with id ${req.params.id} is not available`
            })
        }

        res.status(200).json({
            success: true,
            data: book
        })

    } catch (error) {
        console.log(`Error getting book ${req.params.id} -> `, error)
        res.status(500).json({
            success: false,
            message: `Internal server error`
        })
    }
}

const createBook = async (req, res) => {
    try {
        const { name, author, publication_year } = req.body

        if (!name || !author) {
            return res.status(400).json({
                success: false,
                message: 'Name and author are required.'
            })
        } else if(publication_year < 1000){
            return res.status(400).json({
                success: false,
                message: 'Publication Year cannot be before 1000.'
            })
        }

        const book = await Book.create({
            name,
            author,
            publication_year
        })

        res.status(201).json({
            success: true,
            message: "Book created successfully",
            data: book
        })

    } catch (error) {
        console.log(`Error creating book -> `, error)
        res.status(500).json({
            success: false,
            message: `Internal server error`
        })
    }
}

const updateBook = async (req, res) => {
    try {
        const updateData = {};
        if (req.body.name !== undefined) {
            updateData.name = req.body.name;
        }
        if (req.body.author !== undefined) {
            updateData.author = req.body.author;
        }
        if (req.body.publication_year !== undefined) {
            updateData.publication_year = req.body.publication_year;
        }

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                runValidators: true,
                returnDocument: 'after'
            }
        );

        if (!updatedBook) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `Book with ID ${req.params.id} updated successfully.`,
            data: updatedBook
        });

    } catch (error) {
        console.log("Error updating the specified book -> ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id)

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `Book with id ${req.params.id} deleted successfully`
        });
    } catch (error) {
        console.log("Error deleting the specified book -> ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook }