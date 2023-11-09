import { TObjectId } from './../common.model.js';
import { SelfMood } from "../survey-result.model.js";
import { ICompany } from '../company.model.js';

export interface IReportWallRecord {
    date: Date,
    mood?: SelfMood,
    text?: string
}

export interface IReportWallManager {
    getRecords(companyId: TObjectId<ICompany>, limit: number): Promise<IReportWallRecord[]>;
}



