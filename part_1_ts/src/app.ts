import express from 'express'
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

export const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended: true}))
    app.use(notFound);

    app.use(errorHandler);
}