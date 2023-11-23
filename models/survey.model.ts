import { IEntityManager, TObjectId, TWithId } from "./common.model.js"
import { IRespondent } from "./respondent.model.js";
import { ICompany } from "./company.model.js";
import { IDepartment } from "./department.model.js";

export type TQuestionType = 'wall' | 'company' | 'personal' | 'boolean' | 'checkbox'

export interface ISurvey {
    companyId: TObjectId<ICompany>,
    departmentId: TObjectId<IDepartment>,
    respondentId: TObjectId<IRespondent>,
    questions: TWithId<IQuestion | {}>[],
    feedbackToId: TObjectId<IRespondent>,
    createdAt: Date,
    expiredAt: Date,
    finishedAt?: Date,
    progress?: number
}

export interface IQuestion {
    type: TQuestionType,
    title: string,
    category: string,
    inverted: boolean
}


export interface ISurveyManager extends IEntityManager<ISurvey> {
    generateSurvey(respondentId: TObjectId<IRespondent>, companyId: TObjectId<ICompany>): Promise<TWithId<ISurvey>>;
    completeSurvey(surveyId: TObjectId<ISurvey>): Promise<TWithId<ISurvey>>;
    getLastForRespondent(respondentId: TObjectId<IRespondent>): Promise<TWithId<ISurvey> | null>;
}