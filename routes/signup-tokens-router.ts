import { APIRouter } from "./generic-router.js";
import { TScopeAccessRules } from "./generic-router.js";
import { Scopes } from "../models/user.model.js";
import { IDomainManagers } from "../models/common.model.js";

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
        [Scopes.HR]: false,
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

export const getRouter = ({ tokenManager }: Pick<IDomainManagers, 'tokenManager'>) => {

    const router = new APIRouter('', tokenManager, scopeAccessRules).getRouter();

    router.get('/validate/:_id', (req, res) => {
        tokenManager.validateToken(req.params._id)
            .then(
                token => res.json(token),
                err => res.status(400).send(err));
    })

    router.post('/issue', (req, res) => {
        const { tokenData, inviterId } = req.body;
        tokenManager.issueToken(tokenData, inviterId)
            .then(
                token => res.json(token),
                err => res.status(400).send(err));
    })

    return router;

}
