import { IEntityManager, TObjectId, TWithId } from "./common.model.js"

export interface ICompany{
    name: string,
}

export interface ICompanyStructure {
}

/* export type TCompanyRequired = Pick<ICompany, 'name'> */

export interface ICompanyManager extends IEntityManager<ICompany/* , TCompanyRequired */> {
    returnCompanyStructure(companyId: TObjectId): Promise<ICompanyStructure>;
}