import { Request } from "express";
import { IUser } from "../models/user.model.js";
import { TWithId } from '../models/common.model.js';

export const isSameCompanyRequest = (req: Request) => {
    return (req.user && (<IUser>req.user).companyId.toString() === req.params.companyId);
}

export const isSelfRequest = (req: Request) => {
    return (req.user && (<TWithId<IUser>>req.user)._id.toString() === req.params._id);
}


export const isSameCompanyRequestGuard = (req, res, next) => {
    if (isSameCompanyRequest(res)){
        next();
    } else {
        res.sendStatus(403);
    }
}