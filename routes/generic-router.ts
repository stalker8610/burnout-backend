import express, { Request, RequestHandler, Router } from 'express';
import { IEntityManager, TObjectId } from '../models/common.model.js';
import { Scopes } from '../models/user.model.js';

export type TRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/* Scope access rules define user's ability to make request to endpoint
If no rule provided for request's method means it is unavailable (not allowed due a bug in code)
To set rule for not authorized user use 'null' string as user's scope value 

Examples: 
'GET' : {
    //not authorized user can't make get-request to endpoint
    null: false; 

    // authorized user with scope 'User' can't make get-request to endpoint
    Scope.User: false; 
    
    // authorized user with scope 'HR' can make get-request to endpoint if only the expression is truthly
    Scope.HR: (req) => <some boolean expression>; 
}
*/

export type TScopeAccessRules = Record<TRequestMethod, Record<Scopes | 'null', boolean | ((req: Request) => boolean)>>;

const scopeGuard = (scopeAccessRules: TScopeAccessRules) => {
    return (req, res, next) => {
        const rules = scopeAccessRules[req.method];
        if (!rules) {
            //it's a bug, have to provide rules
            res.sendStatus(405);
        } else {
            let userScope = req.user?.scope ?? 'null';
            const prohibitedStatusCode = req.user ? 403 : 401;

            const scopeRule = rules[userScope];
            if (!scopeRule || typeof scopeRule === 'function' && !scopeRule(req)) {
                res.sendStatus(prohibitedStatusCode);
            } else {
                next();
            }
        }
    }
}

export class APIRouter<T> {

    private readonly router: Router;
    private readonly scopeGuard: (req, res, next) => void;

    constructor(
        private readonly basePath: string,
        private readonly entityManager: IEntityManager<T/* , any */>,
        private readonly scopeAccessRules: TScopeAccessRules) {

        this.router = express.Router();

        this.scopeGuard = scopeGuard(this.scopeAccessRules);


        // retrieve all items
        this.router.get(`${this.basePath}/`, this.scopeGuard, (req, res) => {
            this.entityManager.getAll().then(result => res.status(200).json(result),
                err => res.status(400).send(err));
        });

        //add new item
        this.router.post(`${this.basePath}/`, this.scopeGuard, (req, res) => {
            this.entityManager.create(req.body)
                .then(result => res.status(200).json(result),
                    err => res.status(400).send(err));
        });

        //get exact item
        this.router.get(`${this.basePath}/:_id`, this.scopeGuard, (req, res) => {
            this.entityManager.findById(req.params._id as TObjectId<T>)
                .then(result => res.status(200).json(result),
                    err => res.status(400).send(err));
        });

        //update exact item
        this.router.put(`${this.basePath}/:_id`, this.scopeGuard, (req, res) => {
            this.entityManager.update(req.params._id as TObjectId<T>, req.body)
                .then(result => res.status(200).json(result),
                    err => res.status(400).send(err));
        });

        //delete exact item
        this.router.delete(`${this.basePath}/:_id`, this.scopeGuard, (req, res) => {
            this.entityManager.delete(req.params._id as TObjectId<T>)
                .then(() => res.json({ _id: req.params._id }),
                    err => res.status(400).send(err));
        })

    }

    getRouter() {
        return this.router;
    }

}







