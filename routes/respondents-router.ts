import { APIRouter } from "./generic-router.js";
import { RespondentManager } from "../dal/mongo/respondent.access.js";
import { dbClient } from "../dal/mongo/core.access.js";
import { TScopeAccessRules } from "./generic-router.js";
import { isSelfRequest, isSameCompanyRequest, isSameCompanyRequestGuard, userHasHRScopeGuard } from "./guards.js";
import { Scopes } from "../models/user.model.js";
import { TMethodGuards } from "./generic-router.js";

const scopeAccessRules: TScopeAccessRules = {
    'GET': {
        'null': false,
        [Scopes.User]: isSelfRequest,
        [Scopes.HR]: isSameCompanyRequest,
        [Scopes.Admin]: true,
    },
    'POST': {
        'null': false,
        [Scopes.User]: false,
        [Scopes.HR]: isSameCompanyRequest,
        [Scopes.Admin]: true,
    },
    'PUT': {
        'null': false,
        [Scopes.User]: false,
        [Scopes.HR]: isSameCompanyRequest,
        [Scopes.Admin]: true,
    },
    'DELETE': {
        'null': false,
        [Scopes.User]: false,
        [Scopes.HR]: isSameCompanyRequest,
        [Scopes.Admin]: true,
    }
}

const entityManager = new RespondentManager(dbClient);

const guards: TMethodGuards = {
}

export const router = new APIRouter('/:companyId', entityManager, scopeAccessRules).getRouter();

router.post('/:companyId/:_id/deactivate', isSameCompanyRequestGuard, userHasHRScopeGuard, (req, res) => {
    entityManager.deactivate(req.params._id)
        .then(
            respondent => res.json(respondent),
            err => res.status(400).send(err)
    )
})
