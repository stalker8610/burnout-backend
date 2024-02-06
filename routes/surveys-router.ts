import { APIRouter } from "./generic-router.js";
import { TScopeAccessRules } from "./generic-router.js";
import { Scopes } from "../models/user.model.js";
import { IDomainManagers } from "../models/common.model.js";

const scopeAccessRules: TScopeAccessRules = {
    'GET': {
        'null': true, //TODO false
        [Scopes.User]: true,
        [Scopes.HR]: true,
        [Scopes.Admin]: true,
    },
    'POST': {
        'null': false,
        [Scopes.User]: false,
        [Scopes.HR]: false,
        [Scopes.Admin]: true,
    },
    'PUT': {
        'null': false,
        [Scopes.User]: false,
        [Scopes.HR]: false,
        [Scopes.Admin]: false,
    },
    'DELETE': {
        'null': false,
        [Scopes.User]: false,
        [Scopes.HR]: false,
        [Scopes.Admin]: false,
    }
}

export const getRouter = ({ surveyManager, surveyResultManager }: Pick<IDomainManagers, 'surveyManager' | 'surveyResultManager'>) => {

    const router = new APIRouter('', surveyManager, scopeAccessRules).getRouter();

    router.get('/respondent/:respondentId', (req, res) => {
        surveyManager.getLastForRespondent(req.params.respondentId)
            .then(
                survey => res.status(200).json(survey),
                err => res.status(400).send(err));
    });

    router.post('/generate/:companyId/:respondentId', (req, res) => {
        surveyManager.generateSurvey(req.params.respondentId, req.params.companyId)
            .then(
                (survey) => res.status(200).json(survey),
                err => res.status(400).send(err));
    });

    router.post('/:surveyId/complete', (req, res) => {
        surveyManager.completeSurvey(req.params.surveyId)
            .then(
                survey => res.status(200).json(survey),
                err => res.status(400).send(err));
    });

    router.post('/:surveyId/confirmAnswer', (req, res) => {
        surveyResultManager.confirmAnswer(req.params.surveyId, req.body)
            .then(
                () => res.sendStatus(200),
                err => res.status(400).send(err));
    });

    router.post('/:surveyId/skipQuestion', (req, res) => {
        surveyResultManager.skipQuestion(req.params.surveyId, req.body)
            .then(
                () => res.sendStatus(200),
                err => res.status(400).send(err));
    });

    return router;

}