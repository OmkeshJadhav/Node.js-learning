const Author = require('../models/author-model')

const createAuthor = async (req, res) => {
    try {
        const { name, bio } = req.body

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name of the author is required.'
            })
        }

        const author = await Author.create({
            name,
            bio
        })

        res.status(201).json({
            success: true,
            data: author
        })

    } catch (error) {
        console.log('Error creating author -> ', error)

        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        })
    }
}

const getAuthors = async(req, res) => {
    try {
        const authors = await Author.find({})

        if(authors.length < 1 ){
            res.status(200).json({
                success: true,
                message: "No Author available."
            })
        }

        res.status(200).json({
            success: true,
            data: authors
        })
    } catch (error) {
        console.log('Error getting authors -> ', error)

        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        })
    }


}

module.exports = {
    createAuthor,
    getAuthors
}