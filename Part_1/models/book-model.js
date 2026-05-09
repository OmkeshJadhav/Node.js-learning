const mongoose = require('mongoose')

const BookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Book name is required'],
        unique: true,
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author'
    },
    publication_year: {
        type: Number,
        min: 1000,
        max: new Date().getFullYear()
    }
}, { timestamps: true})

module.exports = mongoose.model('Book', BookSchema)