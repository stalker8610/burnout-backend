import express from 'express';
import { ReportWallManager } from '../dal/mongo/reports/report-wall.access.js';
import { dbClient } from "../dal/mongo/core.access.js";
import { ReportPassStatisticManager } from '../dal/mongo/reports/report-pass-statistic.access.js';

export const router = express.Router();

const reportWallManager = new ReportWallManager(dbClient);
const reportPassStatisticManager = new ReportPassStatisticManager(dbClient);

router.get('/wall/:companyId', (req, res) => {

    let limit = 20;
    if (req.query.limit) {
        try {
            limit = Number(req.query.limit);
        } catch (e) {
            res.status(400).send(`Limit parameter should be a number, got "${req.query.limit}"`);
        }
    }

    reportWallManager.getRecords(req.params.companyId, limit)
        .then(result => res.json(result),
            err => res.status(500).send(err));
})

router.get('/pass-statistic/:companyId', (req, res) => {

    /* let limit = 20;
    if (req.query.limit) {
        try {
            limit = Number(req.query.limit);
        } catch (e) {
            res.status(400).send(`Limit parameter should be a number, got "${req.query.limit}"`);
        }
    } */

    reportPassStatisticManager.getRecords(req.params.companyId)
        .then(result => res.json(result),
            err => res.status(500).send(err));
})

