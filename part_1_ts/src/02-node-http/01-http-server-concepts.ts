/*
    http.createServer creates a low level http server

    type for request object - IncomingMessage
    type for response object - ServerResponse

    (req, res) is a callback. This callback is going to run for every incoming http request.

    request object:
        - method: 
            - GET: Read data,
            - POST: Create data,
            - PATCH: Update partial data,
            - PUT: Update complete data,
            - DELETE: Delete data
        - url: Path in which client requests
        - headers - Actual meta data (extra information) sent by the client with the request
            - e.g. browser type, auth token, content type
        - body - data sent by the client
    
    response object: Used by the server to send data back to client
        - statusCode: Set http status code
        - setHeader: Set header to the response
            - ('Content-Type', 'text/plain), ('Content-Type', 'application/json)
        - end: Signals that no more data will be written. Calling write method after calling end will raise am error.

    server.listen: Start a server listening for connection.
        server.listen(PORT, () => { console.log(`Server is listing on PORT ${PORT}`)})
*/

import http, { IncomingMessage, ServerResponse } from 'node:http'

const PORT = 3000;

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    const method = req.method;
    console.log(method)

    const url = req.url;
    console.log(url)

    const userAgent = req.headers["user-agent"]
    console.log(userAgent)

    res.statusCode = 200;

    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Content-Type', 'application/json')

    res.end(`Basic http node server: Method: ${method} - URL: ${url} - User Agent: ${userAgent}`)
})

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})