import { TObjectId } from '../common.model.js';
import { ICompany } from '../company.model.js';
import { IDepartment } from '../department.model.js';

export interface IReportPassStaticticRecord {
    period: Date,
    departmentId: TObjectId<IDepartment>,
    generated: number,
    taken: number,
    givenAnswers: number
}

export interface IReportPassStatisticResponse {
    periods: Date[],
    records: IReportPassStaticticRecord[]
}

export interface IReportPassStaticticManager {
    getRecords(companyId: TObjectId<ICompany>, from?: Date, to?: Date): Promise<IReportPassStatisticResponse>;
}
