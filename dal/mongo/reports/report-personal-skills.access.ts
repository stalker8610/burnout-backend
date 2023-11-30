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
            const result = await this.db
                .collection('Respondents')
                .aggregate<IReportPersonalSkillsRecord>([
                    { $match: { companyId, _id: respondentId } },
                    { $project: { '_id': 0, 'respondentId': '$_id' } },
                    {
                        $lookup: {
                            from: 'Questions',
                            as: 'questions',
                            pipeline: [
                                { $match: { $or: [{ type: 'boolean' }, { type: 'checkbox' }] } },
                                {
                                    $project: {
                                        '_id': 0,
                                        'questionId': '$_id',
                                        'category': 1
                                    }
                                },
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
                            'respondentId': 1,
                            'category': '$questions.category',
                            'questionId': '$questions.questionId',
                        }
                    },
                    {
                        $lookup: {
                            from: 'SurveyResults',
                            let: {
                                questionId: '$questionId'
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
                                        "is": "$answer.is",
                                        "score": {
                                            $cond: ['$answer.is', 1, -1]
                                        },
                                        "positive": {
                                            $cond: ['$answer.is', 1, 0]
                                        }
                                    },
                                },
                                {
                                    $match: { respondentId }
                                }
                            ]
                        }
                    },
                   /*  {
                        $match: {
                            $expr: { $gt: [{ $size: "$asserts" }, 0] }
                        }
                    }, */
                    {
                        $set: {
                            score: { $sum: '$asserts.score' },
                            positive: { $sum: '$asserts.positive' }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                respondentId: '$respondentId',
                                category: '$category'
                            },
                            score: { $sum: '$score' },
                            positive: { $sum: '$positive' },
                            skills: {
                                $push: {
                                    questionId: "$questionId",
                                    asserts: "$asserts",
                                    score: "$score",
                                    positive: "$positive"
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id.respondentId',
                            skills: {
                                $push: {
                                    category: '$_id.category',
                                    questions: '$skills',
                                    score: '$score',
                                    positive: '$positive'
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            '_id': 0,
                            'respondentId': '$_id',
                            'skills': 1
                        }
                    }
                ]).toArray()

            return result[0]

        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

}