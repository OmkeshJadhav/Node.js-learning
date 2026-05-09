const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
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
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    age: {
        type: Number,
        required: true,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: {
        type: [String],
        default: []
    },
    // createdAt: {
    //     type: Date,
    //     default: Date.now
    // }
}, { timestamps: true })

// UserSchema.index({ email: 1 });  
// Indexing improves query performance by avoiding full collection scans. It is especially useful for frequently searched, filtered, or sorted fields.
// But we already have email: { unique: true } so indexing is redundant here

module.exports = mongoose.model('User', UserSchema)


// Compound indexes
// UserSchema.index({ email: 1, age: -1 });

// Sorting fields
// User.find().sort({ createdAt: -1 });

// When unique: true MongoDB already indexed it
// email: { unique: true }