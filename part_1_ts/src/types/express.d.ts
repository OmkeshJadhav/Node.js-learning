import { TokenPayload } from "./user";

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload
        }
    }
}

export {}

// declare global {
//     namespace Express {
//         interface Request {
//             user?: req.user
//         }
//     }
// }

// export {}
