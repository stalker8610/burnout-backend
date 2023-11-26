import { ICompany } from '../../../models/company.model.js';
import { TObjectId } from '../../../models/common.model.js';
import { MongoClient, Db } from "mongodb";
import {
    IReportPersonalSkillsRecord,
    IReportPersonalSkillsResponse,
    IReportPersonalSkillsManager
} from "../../../models/reports/report-personal-skills.model.js";
import { dbName } from "../core.access.js";
import { errorMessage } from '../../../util/util.js';
import { IRespondent } from '../../../models/respondent.model.js';


export class ReportPersonalSkillsManager implements IReportPersonalSkillsManager {

    protected readonly db: Db;

    constructor(protected readonly dbClient: MongoClient) {
        this.db = this.dbClient.db(dbName);
    }

    async getRecords(companyId: TObjectId<ICompany>, respondentId: TObjectId<IRespondent>): Promise<IReportPersonalSkillsResponse> {
        try {
            const result = await this.db.collection('Respondents').aggregate([
                { $match: { companyId, _id: respondentId } },
                {
                    $lookup: {
                        from: 'Questions',
                        as: 'questions',
                        pipeline: [
                            { $match: { $or: [{ type: 'boolean' }, { type: 'checkbox' }] } },
                            {
                                $project: {
                                    '_id': 1,
                                    'category': 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: '$questions'
                    }
                },
                {
                    $project: {
                        '_id': 0,
                        'respondentId': '$_id',
                        'questionId': '$questions._id',
                        'category': '$questions.category'
                    }
                },
                {
                    $lookup: {
                        from: 'SurveyResults',
                        let: {
                            respondentId: "$respondentId",
                            questionId: "$questionId"
                        },
                        as: 'asserts',
                        pipeline: [
                            {
                                $match: {
                                    companyId,
                                    $expr: { $eq: ["$$questionId", "$questionId"] }
                                }
                            },
                            {
                                $unwind: {
                                    path: "$answer"
                                }
                            },
                            {
                                $project: {
                                    "_id": 0,
                                    "respondentId": "$answer.respondentId",
                                    "is": "$answer.is"
                                }
                            },
                            {
                                $match: {
                                    $expr: { $eq: ["$$respondentId", "$respondentId"] }
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$asserts"
                    }
                },
                {
                    $project: {
                        'category': 1,
                        'questionId': 1,
                        'is': '$asserts.is'
                    }
                },

            ]).toArray();

            return {
                records: [{
                    respondentId,
                    asserts: result as IReportPersonalSkillsRecord['asserts']
                }]
            }

        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

}