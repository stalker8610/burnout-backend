import { APIRouter } from "./generic-router.js";
import { SurveyManager } from "../dal/mongo/survey.access.js";
import { dbClient } from "../dal/mongo/core.access.js";
import { TScopeAccessRules } from "./generic-router.js";
import { Scopes } from "../models/user.model.js";
import { SurveyResultManager } from "../dal/mongo/survey-result.access.js";

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

const surveyManager = new SurveyManager(dbClient);
const surveyResultManager = new SurveyResultManager(dbClient);

export const router = new APIRouter('', surveyManager, scopeAccessRules).getRouter();

router.post('/generate/:companyId/:respondentId', (req, res) => {
    console.log(req.params.respondentId, req.params.companyId);
    surveyManager.generateSurvey(req.params.respondentId, req.params.companyId)
        .then(
            (survey) => res.status(200).json(survey),
            err => res.status(400).send(err));
});

router.post('/:surveyId/complete', (req, res) => {
    console.log('survey completed');
    surveyManager.completeSurvey(req.params.surveyId)
        .then(
            () => res.sendStatus(200),
            err => res.status(400).send(err));
});

router.post('/:surveyId/confirmAnswer', (req, res) => {
    console.log('answer confirmed');
    surveyResultManager.confirmAnswer(req.params.surveyId, req.body)
        .then(
            () => res.sendStatus(200),
            err => res.status(400).send(err));
});

router.post('/:surveyId/skipQuestion', (req, res) => {
    console.log('question skipped');
    surveyResultManager.skipQuestion(req.params.surveyId, req.body)
        .then(
            () => res.sendStatus(200),
            err => res.status(400).send(err));
});

