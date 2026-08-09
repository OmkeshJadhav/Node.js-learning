import http, { IncomingMessage, ServerResponse } from 'node:http'

const PORT = 3000;

const server = http.createServer((
    req: IncomingMessage, res: ServerResponse
) => {
    const method = req.method ?? "GET";

    const requestUrl = new URL(req.url ?? '/', `http:${req.headers.host}`)

    const pathname = requestUrl.pathname;

    res.setHeader('Content-Type', 'text/plain')

    if(method === "GET" && pathname === "/health"){
        res.statusCode = 200;
        res.end("Server is healthy");
        return;
    }

    if(method === "GET" && pathname === '/users'){
        res.statusCode = 200;
        res.end(`User list retrived successfully!`)
        return;
    }

    if(method === "POST" && pathname === "/user"){
        res.statusCode = 201;
        res.end('User created successfully!!');
        return;
    }

    res.statusCode = 404;
    res.end('Route not found.');
    
})

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})