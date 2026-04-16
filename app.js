require('dotenv').config()
const express = require('express')
const connectToDB = require('./database/db')
const userRoutes = require('./routes/user-routes')
const bookRoutes = require('./routes/book-routes')
const authRoutes = require('./routes/auth-routes')
const homeRoutes = require('./routes/home-routes')
const adminRoutes = require('./routes/admin-routes')

const app = express()
const PORT = process.env.PORT || 3000

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/home', homeRoutes)
app.use('/api/admin', adminRoutes)

const startServer = async () => {
    try {
        // connect to database 
        connectToDB()

        // listen to the server
        app.listen(PORT, () => {
            console.log(`App is listening on PORT ${PORT}`);
        });
    } catch (error) {
        console.error("Server start failed -> ", error);
    }
}

startServer()
