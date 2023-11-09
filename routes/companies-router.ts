import { APIRouter } from "./generic-router.js";
import { CompanyManager } from "../dal/mongo/company.access.js";
import { dbClient } from "../dal/mongo/core.access.js";
import { TScopeAccessRules } from "./generic-router.js";
import { isSameCompanyRequest } from "./guards.js";
import { Scopes } from "../models/user.model.js";
import { isSameCompanyRequestGuard } from "./guards.js";

const scopeAccessRules: TScopeAccessRules = {
    'GET': {
        'null': false,
        [Scopes.User]: false,
        [Scopes.HR]: isSameCompanyRequest,
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
        [Scopes.HR]: isSameCompanyRequest,
        [Scopes.Admin]: true,
    },
    'DELETE': {
        'null': false,
        [Scopes.User]: false,
        [Scopes.HR]: false,
        [Scopes.Admin]: true,
    }
}

const entityManager = new CompanyManager(dbClient);
export const router = new APIRouter(/* 'companies',  */entityManager, scopeAccessRules).getRouter();

router.get('/:companyId/structure', /* isSameCompanyRequestGuard, */ (req, res) => {
    entityManager.getCompanyStructure(req.params.companyId)
        .then(
            (data) => res.json(data),
            err => res.status(400).send(err));
});




