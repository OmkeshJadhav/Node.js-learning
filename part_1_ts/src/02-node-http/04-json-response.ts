import http, { IncomingMessage, ServerResponse } from 'node:http'

const PORT = 3000

type User = {
    id: number,
    email: string;
    name: string;
}

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
    error?: string
}

const users: User[] = [
    {id:1, email:'omkesh.jadhav@gmail.com', name: 'Omkesh'},
    {id:2, email:'dipti.jadhav@gmail.com', name: 'Dipti'}
]

function sendJson<T> (
    statusCode: number,
    res: ServerResponse,
    body: ApiResponse<T>
):void {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json'),
    res.end(JSON.stringify(body))
}

const server = http.createServer((
    req: IncomingMessage, res: ServerResponse
) => {
    const method = req.method;

    const requestUrl = new URL(req.url ?? '/', `http:${req.headers.host}`);
    const pathname = requestUrl.pathname;

    if(method === 'GET' && pathname === "/"){
        sendJson(200, res, {
            success: true,
            message: `Server is running`,
            data: {
                routes: ['GET/users']
            }
        });
        return;
    }

    if(method === 'GET' && pathname === '/users'){
        sendJson(200, res, {
            success: true,
            message: 'User list retrieved successfully',
            data: users
        });
        return;
    }

    sendJson<null>(404, res, {
        success: false,
        message: 'Route not found',
        error: `${method} ${pathname} does not exists`
    })
})

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})