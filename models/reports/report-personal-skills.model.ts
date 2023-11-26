import { TObjectId } from '../common.model.js';
import { ICompany } from '../company.model.js';
import { IRespondent } from '../respondent.model.js';
import { IQuestion } from '../survey.model.js';

export interface IReportPersonalSkillsRecord {
    respondentId: TObjectId<IRespondent>,
    asserts: Array<{
        category: string,
        questionId: TObjectId<IQuestion>,
        is: boolean
    }>
}

export interface IReportPersonalSkillsResponse {
    records: IReportPersonalSkillsRecord[]
}

export interface IReportPersonalSkillsManager {
    getRecords(companyId: TObjectId<ICompany>, respondentId: TObjectId<IRespondent>): Promise<IReportPersonalSkillsResponse>;
}
