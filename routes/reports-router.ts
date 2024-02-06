import express from 'express';
import { IDomainManagers } from '../models/common.model.js';

export const getRouter = (domainManagers: Pick<IDomainManagers,
    'reportWallManager' |
    'reportCompanyScoresManager' |
    'reportPassStatisticManager' |
    'reportPersonalEfficiencyManager' |
    'reportPersonalSkillsManager'>) => {

    const router = express.Router();

    router.get('/wall/:companyId', (req, res) => {

        let limit = 20;
        if (req.query.limit) {
            try {
                limit = Number(req.query.limit);
            } catch (e) {
                res.status(400).send(`Limit parameter should be a number, got "${req.query.limit}"`);
            }
        }

        domainManagers.reportWallManager.getRecords(req.params.companyId, limit)
            .then(result => res.json(result),
                err => res.status(500).send(err));
    })

    router.get('/pass-statistic/:companyId', (req, res) => {
        domainManagers.reportPassStatisticManager.getRecords(req.params.companyId)
            .then(result => res.json(result),
                err => res.status(500).send(err));
    })

    router.get('/company-scores/:companyId', (req, res) => {
        domainManagers.reportCompanyScoresManager.getRecords(req.params.companyId)
            .then(result => res.json(result),
                err => res.status(500).send(err));
    })

    router.get('/personal-efficiency/:companyId/:respondentId', (req, res) => {
        domainManagers.reportPersonalEfficiencyManager.getRecords(req.params.companyId, req.params.respondentId)
            .then(result => res.json(result),
                err => res.status(500).send(err));
    })

    router.get('/personal-skills/:companyId/:respondentId', (req, res) => {
        console.log('companyId', req.params.companyId);
        console.log('respondentId', req.params.respondentId);
        domainManagers.reportPersonalSkillsManager.getRecords(req.params.companyId, req.params.respondentId)
            .then(result => res.json(result),
                err => res.status(500).send(err));
    })

    return router;

}


