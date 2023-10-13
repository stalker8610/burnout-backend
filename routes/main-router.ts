import express from 'express';
import * as path from 'path';

export const router = express.Router();
router.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'ui/index.html'));
})