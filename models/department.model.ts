import { TObjectId, IEntityManager } from "./common.model.js"

export interface IDepartment {
    companyId: TObjectId,
    title: string,
    chiefId?: TObjectId,
    parentDepartmentId?: TObjectId
    //subDepartmentIds: TObjectId[],
}

export type TDepartmentRequired = Pick<IDepartment, 'companyId' | 'title'>

export interface IDepartmentManager extends IEntityManager<IDepartment/* , TDepartmentRequired */> {}