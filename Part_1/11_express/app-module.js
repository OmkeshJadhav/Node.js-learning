const express = require('express')
const app = express()
const port = 3000

// app.set(name, value) - Assigns setting name to value.
// Application level setting
app.set('view engine', 'ejs')

// Routing
app.get('/', (req, res) => {
    res.send('GET request to homepage')
})

// app.post(path, callback [, callback ...]) - Routes HTTP POST requests to the specified path with the specified callback functions
app.post('/api/data', (req, res) => {
    res.json({
        message: 'Data Received',
        data: req.body
    })
})

// app.put(path, callback [, callback ...]) - Routes HTTP PUT requests to the specified path with the specified callback functions.
app.put('/', (req, res) => {
  res.send('PUT request to homepage')
})

app.delete('/', (req, res) => {
    res.send('DELETE request to homepage')
})


// Error Handling Middleware
app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(500).send('Something went wrong')
})


// Listening connections on the given path
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
    
})



// app.param(name, callback) - Param callback functions are local to the router on which they are defined. So, param callbacks defined on app will be triggered only by route parameters defined on app routes.
app.param(['id', 'page'], (req, res, next, value) => {
  console.log('CALLED ONLY ONCE with', value)
  next()
})

app.get('/user/:id/:page', (req, res, next) => {
  console.log('although this matches')
  next()
})

app.get('/user/:id/:page', (req, res) => {
  console.log('and this matches too')
  res.end()
})

// On GET /user/42/3, the following is printed:
    // CALLED ONLY ONCE with 42
    // CALLED ONLY ONCE with 3
    // although this matches
    // and this matches too


// app.path() - // Returns the canonical path of the app, a string.

// app.route(path) - Returns an instance of a single route, which you can then use to handle HTTP verbs with optional middleware. Use app.route() to avoid duplicate route names (and thus typo errors).