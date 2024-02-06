
import { APIRouter } from "./generic-router.js";
import { TScopeAccessRules } from "./generic-router.js";
import { isSameCompanyRequest } from "./guards.js";
import { Scopes } from "../models/user.model.js";
import { IDomainManagers } from '../models/common.model.js';

const scopeAccessRules: TScopeAccessRules = {
    'GET': {
        'null': false,
        [Scopes.User]: false,
        [Scopes.HR]: /* isSameCompanyRequest */true,
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

export const getRouter = ({ departmentManager }: Pick<IDomainManagers, 'departmentManager'>) => {
    const router = new APIRouter('/:companyId', departmentManager, scopeAccessRules).getRouter();
    return router;
}



