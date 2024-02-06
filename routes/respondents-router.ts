import { APIRouter } from "./generic-router.js";
import { TScopeAccessRules } from "./generic-router.js";
import { isSelfRequest, isSameCompanyRequest, isSameCompanyRequestGuard, userHasHRScopeGuard } from "./guards.js";
import { Scopes } from "../models/user.model.js";
import { IDomainManagers } from "../models/common.model.js";

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

export const getRouter = ({ respondentManager }: Pick<IDomainManagers, 'respondentManager'>) => {

    const router = new APIRouter('/:companyId', respondentManager, scopeAccessRules).getRouter();

    router.post('/:companyId/:_id/deactivate', isSameCompanyRequestGuard, userHasHRScopeGuard, (req, res) => {
        respondentManager.deactivate(req.params._id)
            .then(
                respondent => res.json(respondent),
                err => res.status(400).send(err)
            )
    })

    return router;
}