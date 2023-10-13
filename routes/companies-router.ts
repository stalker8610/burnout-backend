import { APIRouter } from "./generic-router.js";
import { CompanyManager } from "../dal/mongo/company.access.js";
import { dbClient } from "../dal/mongo/core.access.js";
import { TScopeAccessRules } from "./generic-router.js";
import { isSameCompanyRequest } from "./guards.js";
import { Scopes } from "../models/user.model.js";

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
export const router = new APIRouter('companies', entityManager, scopeAccessRules).getRouter();





