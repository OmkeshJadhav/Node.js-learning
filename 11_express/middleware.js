// Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle.

// Middleware functions can perform the following tasks:
    // Execute any code.
    // Make changes to the request and the response objects.
    // End the request-response cycle.
    // Call the next middleware function in the stack.

// If the current middleware function does not end the request-response cycle, it must call next() to pass control to the next middleware function. Otherwise, the request will be left hanging.

const express = require('express')
const app = express()
const port = 3000

