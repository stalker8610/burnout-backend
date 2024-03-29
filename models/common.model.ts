import { ISurveyResultManager } from "./survey-result.model.js";
import { OptionalId } from "mongodb";
import { ICompany, ICompanyManager } from "./company.model.js";
import { IRespondentManager } from "./respondent.model.js";
import { ISurveyManager } from "./survey.model.js";
import { IUserManager } from "./user.model.js";
import { ISignupTokenManager } from "./signup-token.model.js";
import { IDepartmentManager } from "./department.model.js";
import { IReportWallManager } from "./reports/report-wall.model.js";
import { IReportPassStaticticManager } from "./reports/report-pass-statistic.model.js";
import { IReportCompanyScoresManager } from "./reports/report-company-scores.model.js";
import { IReportPersonalEfficiencyManager } from "./reports/report-personal-efficiency.model.js";
import { IReportPersonalSkillsManager } from "./reports/report-personal-skills.model.js";

// HEX string of 24 bytes
export type TObjectId<T> = string;

export type TWithId<T> = T & {
    _id: TObjectId<T>
}

export interface IWithCompanyId {
    companyId: TObjectId<ICompany>
}

export interface IEntityManager<T/* , RequiredT */> {
    create(data: T): Promise<TWithId<T>>;
    findById(_id: TObjectId<T>): Promise<TWithId<T>>;
    update(_id: TObjectId<T>, data: Partial<OptionalId<T>>): Promise<TWithId<T>>;
    delete(_id: TObjectId<T>): Promise<true>;
    getAll(): Promise<TWithId<T>[]>
}


export interface IDomainManagers {
    respondentManager : IRespondentManager, 
    surveyManager: ISurveyManager, 
    surveyResultManager: ISurveyResultManager,
    userManager: IUserManager, 
    tokenManager: ISignupTokenManager,
    departmentManager: IDepartmentManager,
    companyManager: ICompanyManager,
    reportWallManager: IReportWallManager,
    reportPassStatisticManager: IReportPassStaticticManager,
    reportCompanyScoresManager: IReportCompanyScoresManager,
    reportPersonalEfficiencyManager: IReportPersonalEfficiencyManager,
    reportPersonalSkillsManager: IReportPersonalSkillsManager
}