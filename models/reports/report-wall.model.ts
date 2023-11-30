import { TObjectId } from '../common.model.js';
import { SelfMood } from "../survey-result.model.js";
import { ICompany } from '../company.model.js';
import { IRespondent } from '../respondent.model.js';

export interface IReportWallResponse {
    records: IReportWallRecord[]
} 

export interface IReportWallRecord {
    date: string,
    mood?: SelfMood,
    text?: string,
    respondentId?: TObjectId<IRespondent>
}

export interface IReportWallManager {
    getRecords(companyId: TObjectId<ICompany>, limit: number): Promise<IReportWallResponse>;
}



