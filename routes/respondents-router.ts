import { APIRouter } from "./generic-router.js";
import { RespondentManager } from "../dal/mongo/respondent.access.js";
import { dbClient } from "../dal/mongo/core.access.js";
import { TScopeAccessRules } from "./generic-router.js";
import { isSelfRequest, isSameCompanyRequest, isSameCompanyRequestGuard } from "./guards.js";
import { Scopes } from "../models/user.model.js";

/* const initialSignUp = (req) => {
    //token should be provided in request
    return (req.params.signUpToken);
} */

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
export const router = new APIRouter('/respondents/:companyId', entityManager, scopeAccessRules).getRouter();


