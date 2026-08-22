import express from 'express'
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { configureCors } from './config/cors-config';
import { apiRouter } from './routes';

export const createApp = () => {
    const app = express();
    app.use(configureCors())
    app.use(express.json());
    app.use(express.urlencoded({extended: true}))

    app.use('/api', apiRouter)

    app.use(notFound);
    app.use(errorHandler);

    return app
}