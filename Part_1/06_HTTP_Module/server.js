const http = require('http')
const PORT = 3000

const server = http.createServer((req, res) => {
    res.writeHead(200, {'content-type': 'text/plain'})
    res.end('Hello Node.js from HTTP module')
    console.log('Req: ', req);
    
})

server.listen(PORT, () => {
    console.log(`Server is now listening on the PORT ${PORT}`);
})