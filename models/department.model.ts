import { TObjectId, IEntityManager, IWithCompanyId } from "./common.model.js"
import { IRespondent } from "./respondent.model.js"

export interface IDepartment extends IWithCompanyId {
    title: string,
    chiefId?: TObjectId<IRespondent>,
    parentDepartmentId?: TObjectId<IDepartment>
    //subDepartmentIds: TObjectId[],
}

export type TDepartmentRequired = Pick<IDepartment, 'companyId' | 'title'>

export interface IDepartmentManager extends IEntityManager<IDepartment/* , TDepartmentRequired */> {}