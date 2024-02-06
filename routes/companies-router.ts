import { APIRouter } from "./generic-router.js";
import { TScopeAccessRules } from "./generic-router.js";
import { isSameCompanyRequest } from "./guards.js";
import { Scopes } from "../models/user.model.js";
import { isSameCompanyRequestGuard } from "./guards.js";
import { IDomainManagers } from "../models/common.model.js";

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

export const getRouter = ({ companyManager }: Pick<IDomainManagers, 'companyManager'>) => {
    
    const router = new APIRouter('', companyManager, scopeAccessRules).getRouter();
    
    router.get('/:companyId/structure', isSameCompanyRequestGuard, (req, res) => {
        companyManager.getCompanyStructure(req.params.companyId)
            .then(
                (data) => res.json(data),
                err => res.status(400).send(err));
    });

    return router;

}


