import { ICompany } from './../../../models/company.model.js';
import { TObjectId } from './../../../models/common.model.js';
import { MongoClient, Db } from "mongodb";
import { IReportWallManager, IReportWallRecord } from "../../../models/reports/report-wall.js";
import { dbName } from "../core.access.js";
import { errorMessage } from '../../../util/util.js';


export class ReportWallManager implements IReportWallManager {

    protected readonly db: Db;
    //private cache = <Array<TWithId<T>>>[];

    constructor(protected readonly dbClient: MongoClient) {
        this.db = this.dbClient.db(dbName);
    }

    async getRecords(companyId: TObjectId<ICompany>, limit: number): Promise<IReportWallRecord[]> {
        try {
            const result = await this.db.collection('Questions').aggregate([
                { $match: { type: 'wall' } },
                {
                    $lookup: {
                        from: 'SurveyResults',
                        localField: '_id',
                        foreignField: 'questionId',
                        as: 'answers',
                    }
                },
                { $unwind: '$answers' },
                {
                    $match: {
                        "answers.companyId": companyId,
                        "answers.skipped": { $exists: false }
                    }
                },
                { $sort: { "answers.date": -1 } },
                { $limit: limit },
                { $project: {
                    '_id': 0,
                    'date': '$answers.date',
                    'mood': '$answers.answer.mood',
                    'text': '$answers.answer.text'
                }}
            ]).toArray() as IReportWallRecord[];
            return result;
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

}