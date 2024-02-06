import express from 'express';
import path from 'path';

export const getRouter = () => {
    const router = express.Router();
    router.get('/', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'ui/index.html'));
    })

    return router
}