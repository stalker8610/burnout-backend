import { APIRouter } from "./generic-router.js";
import { SingupTokenManager } from "../dal/mongo/token.access.js";
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
        [Scopes.User]: false,
        [Scopes.HR]: false,
        [Scopes.Admin]: true,
    },
    'POST': {
        'null': false,
        [Scopes.User]: false,
        [Scopes.HR]: true,
        [Scopes.Admin]: true,
    },
    'PUT': {
        'null': false,
        [Scopes.User]: false,
        [Scopes.HR]: false,
        [Scopes.Admin]: true,
    },
    'DELETE': {
        'null': false,
        [Scopes.User]: false,
        [Scopes.HR]: false,
        [Scopes.Admin]: true,
    }
}

const entityManager = new SingupTokenManager(dbClient);
export const router = new APIRouter('/tokens', entityManager, scopeAccessRules).getRouter();


