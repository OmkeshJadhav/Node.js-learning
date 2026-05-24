const mongoose = require('mongoose')
const argon2 = require('argon2')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
}, { timestamps: true })


// Pre is a Mongoose middleware (hook) that runs before a document is saved to MongoDB
// pre() means Run this function BEFORE a specific operation. Here, pre('save') means Run this middleware before .save() operation executes.
// This middleware runs when: await user.save() or await User.create({...}) because create() internally uses save().
// middleware function receives next - next() tells Mongoose:"Middleware completed, continue saving." - If you pass an error:next(error then saving stops and error handling starts.
// Use normal function as Arrow functions do not have their own this.

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await argon2.hash(this.password)
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await argon2.verify(this.password, candidatePassword)
    } catch (error) {
        throw error;

    }
}

userSchema.index({ username: 'text' })

const User = mongoose.model('User', userSchema)

module.exports = User;