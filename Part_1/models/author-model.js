const { type } = require('express/lib/response')
const mongoose = require('mongoose')

const AuthorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Author name is required'],
        unique: true,
        trim: true
    },
    bio: {
        type: String,
    }
})

module.exports = mongoose.model('Author', AuthorSchema)