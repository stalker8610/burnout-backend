import { IEntityManager, TObjectId, TWithId } from "./common.model.js"
import { IDepartment } from "./department.model.js";
import { IRespondent } from "./respondent.model.js";

export interface ICompany{
    name: string,
}

export interface ICompanyStructure {
    companyId: TObjectId<ICompany>,
    departments: IDepartment[],
    team: IRespondent[]
}

export interface ICompanyManager extends IEntityManager<ICompany> {
    getCompanyStructure(companyId: TObjectId<ICompany>): Promise<ICompanyStructure>;
}