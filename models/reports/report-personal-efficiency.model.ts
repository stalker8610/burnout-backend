import { TObjectId } from '../common.model.js';
import { ICompany } from '../company.model.js';
import { IRespondent } from '../respondent.model.js';
import { PersonalFeedbackMood } from '../survey-result.model.js';

export interface IReportPersonalEfficiencyRecord {
    respondentId: TObjectId<IRespondent>,
    rates: Array<{
        mood: PersonalFeedbackMood,
        text: number
    }>
}

export interface IReportPersonalEfficiencyResponse extends IReportPersonalEfficiencyRecord {}

export interface IReportPersonalEfficiencyManager {
    getRecords(companyId: TObjectId<ICompany>, respondentId: TObjectId<IRespondent>): Promise<IReportPersonalEfficiencyResponse>;
}
