import express from 'express'
import { errorHandler } from './middlewares/errorHandler';

export const createApp = () => {
    const app = express();

    app.use(express.json());

    app.use(errorHandler);
}