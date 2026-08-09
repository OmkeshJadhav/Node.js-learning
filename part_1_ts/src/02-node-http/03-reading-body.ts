import http, { IncomingMessage, ServerResponse } from 'node:http'

const PORT = 3000;

type CreateUserBody = {
    name?: string,
    email?: string
}

const server = http.createServer((
    req: IncomingMessage, res: ServerResponse
) => {
    const method = req.method ?? "GET";

    const requestUrl = new URL(req.url ?? '/', `http:${req.headers.host}`)  // Gives URL object which has - href, origin, protocol, host, hostname, port, pathname, search, searchParams

    const pathname = requestUrl.pathname;
    // const pathname = req.url;

    res.setHeader('Content-Type', 'text/plain')

    if (method === "POST" && pathname === "/users") {
        const chunks: Buffer[] = []

        // data event is going to run every time node receives a new body chunk 
        req.on("data", (chunk: Buffer) => {
            chunks.push(chunk)
        })

        req.on("end", () => {
            try {
                const rawBody = Buffer.concat(chunks).toString('utf-8')

                if (!rawBody) {
                    res.statusCode = 400;
                    res.end('Request body is required.');
                    return;
                }

                const body = JSON.parse(rawBody) as CreateUserBody;

                if (!body.name || !body.email) {
                    res.statusCode = 400;
                    res.end('Both name and email are required!')
                    return
                }

                res.statusCode = 201;
                res.end(`User created succefully ${body.name} - ${body.email}!`)

            } catch (error) {
                res.statusCode = 400;
                res.end('Invalid request body!')
            }
        })

        req.on("error", () => {
            res.statusCode = 500;
            res.end('Failed to read request body!')
        })

        return
    }

    res.statusCode = 404;
    res.end('Route not found.');

})

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})