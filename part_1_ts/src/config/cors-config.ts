import cors from 'cors'

export const configureCors = () => {
    return cors({

        // origin -> this will tell that which origin are allowed to access your APIs
        origin: (origin, callback) => {
            const whitelistedOrigins = [
                'http://localhost:3000',  // local dev
                'https://yourcustomdomain.com'  // production domain
            ]

            if (!origin || whitelistedOrigins.includes(origin)) {    // !origin -> Some requests do not include an Origin header, such as:Postman requests, Mobile apps, Server-to-server requests, Same-origin requests in some cases - In these cases origin is undefined/null/empty
                callback(null, true)  // true -> Giving permission so that request can be called
            } else {
                callback(new Error('Not allowed by cors.'))
            }
        },

        // methods -> which methods are allowed
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],

        // allowedHeaders -> which headers are allowed
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept-Version'
        ],

        // exposedHeaders -> expose all the headers that can be exposed to the client
        exposedHeaders: [
            'Content-Range',
            'X-Content-Range',
            'X-Total-Count'
        ],

        // credentials -> Enables support for cookies and authorization
        credentials: true,

        // preflightContinue -> Pass the CORS preflight response to the next handler
        preflightContinue: false,

        // maxAge -> cache the preflight responses for the mentioned time (in seconds) - avoid sending options requests multiple times
        maxAge: 600,
        
        // optionsSuccessStatus -> Provide a status code to use for successful OPTIONS requests 
        optionsSuccessStatus: 204
    })
}