import { TObjectId } from '../common.model.js';
import { ICompany } from '../company.model.js';
import { IDepartment } from '../department.model.js';
import { IQuestion } from '../question.model.js';

export interface IReportCompanyScoresRecord {
    category: string,
    count: number, //count of answers in the category
    value: number, //total score in the category
    questions: Array<
        Pick<IQuestion, 'title' | 'inverted'> & {
            answers: Array<{
                departmentId: TObjectId<IDepartment>,
                pureScore: number, // score given by user
                calcScore: number, // calculated score with inverted condition
            }>,
            count: number, // count of answers on the question
            value: number, // total score for the question
        }>
}

export interface IReportCompanyScoresResponse {
    period: [Date, Date], // dates
    records: IReportCompanyScoresRecord[]
}

export interface IReportCompanyScoresManager {
    getRecords(companyId: TObjectId<ICompany>): Promise<IReportCompanyScoresResponse>;
}


