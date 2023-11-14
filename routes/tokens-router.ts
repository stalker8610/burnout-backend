import { APIRouter } from "./generic-router.js";
import { SingupTokenManager } from "../dal/mongo/token.access.js";
import { dbClient } from "../dal/mongo/core.access.js";
import { TScopeAccessRules } from "./generic-router.js";
import { Scopes } from "../models/user.model.js";

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
export const router = new APIRouter('', entityManager, scopeAccessRules).getRouter();

router.get('/validate/:_id', (req, res) => {
    entityManager.validateToken(req.params._id)
        .then(
            () => res.sendStatus(200),
            err => res.status(400).send(err));
})

