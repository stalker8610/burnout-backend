import { ICompany } from '../../../models/company.model.js';
import { TObjectId } from '../../../models/common.model.js';
import { MongoClient, Db } from "mongodb";
import { dbName } from "../core.access.js";
import { errorMessage } from '../../../util/util.js';
import { IReportCompanyScoresResponse, IReportCompanyScoresRecord, IReportCompanyScoresManager } from '../../../models/reports/report-company-scores.model.js';
import { generateDateBoundaries } from '../../../util/util.js';

export class ReportCompanyScoresManager implements IReportCompanyScoresManager {

    protected readonly db: Db;

    constructor(protected readonly dbClient: MongoClient) {
        this.db = this.dbClient.db(dbName);
    }

    async getRecords(companyId: TObjectId<ICompany>): Promise<IReportCompanyScoresResponse> {
        try {

            const boundaries = generateDateBoundaries(1);
            let result = await this.db
                .collection('Questions')
                .aggregate<IReportCompanyScoresRecord>([
                    {
                        $match: { type: "company" }
                    },
                    {
                        $group: {
                            _id: "$category"
                        }
                    },
                    {
                        $lookup: {
                            from: "Questions",
                            localField: "_id",
                            foreignField: "category",
                            as: "questions",
                            pipeline: [
                                {
                                    $match: { type: "company" }
                                },
                                {
                                    $lookup: {
                                        from: "SurveyResults",
                                        let: {
                                            inverted: "$inverted"
                                        },
                                        localField: "_id",
                                        foreignField: "questionId",
                                        as: "answers",
                                        pipeline: [
                                            {
                                                $match: {
                                                    companyId,
                                                    date: { $gte: boundaries[0], $lt: boundaries[2] },
                                                    skipped: { $exists: false }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "_id": 0,
                                                    "departmentId": 1,
                                                    "pureScore": "$answer.score",
                                                    "calcScore": {
                                                        $switch: {
                                                            branches: [
                                                                {
                                                                    case: "$$inverted", then: {
                                                                        $switch: {
                                                                            branches: [
                                                                                { case: { $gt: ["$answer.score", 5] }, then: 0 },
                                                                                { case: { $gt: ["$answer.score", 1] }, then: 0.5 },
                                                                            ],
                                                                            default: 1
                                                                        }
                                                                    }
                                                                }
                                                            ],
                                                            default: {
                                                                $switch: {
                                                                    branches: [
                                                                        { case: { $gt: ["$answer.score", 8] }, then: 1 },
                                                                        { case: { $gt: ["$answer.score", 4] }, then: 0.5 },
                                                                    ],
                                                                    default: 0
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    $match: {
                                        $expr: {
                                            $gt: [{ $size: { $ifNull: ["$answers", []] } }, 0]
                                        }
                                    }
                                },
                                {
                                    $set: {
                                        value: { $sum: "$answers.calcScore" },
                                        count: { $size: "$answers" }
                                    },
                                },
                                /* { РАСКОММЕНТИРОВАТЬ!!!
                                    $match: {
                                        count: { $gte: 5 }
                                    }
                                } */
                            ]
                        }
                    },
                    {
                        $match: {
                            $expr: {
                                $gt: [{ $size: { $ifNull: ["$questions", []] } }, 0]
                            }
                        }
                    },
                    {
                        $set: {
                            value: { $sum: "$questions.value" },
                            count: { $sum: "$questions.count" }
                        },
                    },
                    {
                        $project: {
                            "_id": 0,
                            "category": "$_id",
                            "questions.title": 1,
                            "questions.inverted": 1,
                            "questions.answers": 1,
                            "questions.value": 1,
                            "questions.count": 1,
                            "value": 1,
                            "count": 1
                        }
                    }
                ]).toArray();

            return {
                period: [boundaries[0], boundaries[2]],
                records: result
            }

        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

}