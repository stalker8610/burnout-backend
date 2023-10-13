import { Scopes } from "../models/user.model.js"
import { TObjectId } from "../models/common.model.js"

export interface ICompany {
    name: string,
}

export interface IDepartment {
    companyId: TObjectId,
    title: string,
    chiefId: TObjectId,
    subDepartmentIds: TObjectId[],
}

