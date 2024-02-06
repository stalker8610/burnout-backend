import { ICompany } from './../../../models/company.model.js';
import { TObjectId } from './../../../models/common.model.js';
import { type MongoClient, type Db } from "mongodb";
import { IReportWallManager, IReportWallResponse, IReportWallRecord } from "../../../models/reports/report-wall.model.js";
import { dbName } from "../core.access.js";
import { errorMessage } from '../../../util/util.js';


export class ReportWallManager implements IReportWallManager {

    protected readonly db: Db;
    constructor(protected readonly dbClient: MongoClient) {
        this.db = this.dbClient.db(dbName);
    }

    async getRecords(companyId: TObjectId<ICompany>, limit: number): Promise<IReportWallResponse> {
        try {
            const result = await this.db
                .collection('Questions')
                .aggregate<IReportWallRecord>([
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
                    {
                        $project: {
                            '_id': 0,
                            'date': '$answers.date',
                            'mood': '$answers.answer.mood',
                            'text': '$answers.answer.text',
                            'respondentId': '$answers.respondentId'
                        }
                    }
                ]).toArray();
            return {
                records: result
            }
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

}