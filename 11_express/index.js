// Express.js is a web framework for Node.js

// **
// Key Features
// 1) Routing
// 2) Middlewares
// 3) Template Engines like ejs, pug To generate dynamic HTML
// 4) Static File Serving
// 5) Error Handling
// 6) Creating Restful APIs
// */


const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
    
})

// app starts a server and listens on port 3000 for connections. The app responds with “Hello World!” for requests to the root URL (/) or route. 
// For every other path, it will respond with a 404 Not Found.