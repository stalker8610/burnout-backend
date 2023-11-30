import { TObjectId } from '../common.model.js';
import { ICompany } from '../company.model.js';
import { IRespondent } from '../respondent.model.js';
import { IQuestion } from '../survey.model.js';

export interface IReportPersonalSkillsRecord {
    respondentId: TObjectId<IRespondent>,
    skills: Array<{
        category: string,
        questions: Array<{
            questionId: TObjectId<IQuestion>,
            asserts: Array<{
                is: boolean,
                score: -1 | 1,
                positive: 1 | 0
            }>
        }>,
        score: number,
        positive: number
    }>
}

export interface IReportPersonalSkillsResponse extends IReportPersonalSkillsRecord { }

export interface IReportPersonalSkillsManager {
    getRecords(companyId: TObjectId<ICompany>, respondentId: TObjectId<IRespondent>): Promise<IReportPersonalSkillsResponse>;
}
