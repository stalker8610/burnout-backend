import { ICompany } from '../../../models/company.model.js';
import { TObjectId } from '../../../models/common.model.js';
import { MongoClient, Db } from "mongodb";
import { IReportPassStaticticRecord, IReportPassStatisticResponse, IReportPassStaticticManager } from "../../../models/reports/report-pass-statistic.model.js";
import { dbName } from "../core.access.js";
import { errorMessage } from '../../../util/util.js';
import { generateDateBoundaries } from '../../../util/util.js';


export class ReportPassStatisticManager implements IReportPassStaticticManager {

    protected readonly db: Db;

    constructor(protected readonly dbClient: MongoClient) {
        this.db = this.dbClient.db(dbName);
    }

    async getRecords(companyId: TObjectId<ICompany>, from?: Date, to?: Date): Promise<IReportPassStatisticResponse> {
        try {

            const boundaries = generateDateBoundaries(5);

            const generatedSurveysPipeline = [
                {
                    $match: {
                        companyId,
                    }
                },
                {
                    $bucket: {
                        groupBy: '$createdAt',
                        boundaries,
                        default: 'olders',
                        output: {
                            "generatedSurveys": {
                                $push: {
                                    "departmentId": '$departmentId'
                                }
                            }
                        }
                    }
                },
                {
                    $match: { '_id': { $not: { $eq: 'olders' }, } }

                },
                {
                    $unwind: { path: "$generatedSurveys" }
                },
                {
                    $project: {
                        "departmentId": "$generatedSurveys.departmentId"
                    }
                },
                {
                    $group: {
                        _id: {
                            period: "$_id",
                            departmentId: "$departmentId"
                        },
                        generated: { $count: {} }
                    }
                },
                {
                    $project: {
                        "_id": 0,
                        "generated": 1,
                        "period": "$_id.period",
                        "departmentId": "$_id.departmentId",
                    }
                }
            ];

            // if at least one answer done at survey
            const takenSurveysPipeline = [
                {
                    $match: {
                        companyId,
                    }
                },
                {
                    $bucket: {
                        groupBy: '$date',
                        boundaries,
                        default: 'olders',
                        output: {
                            "takenSurveys": {
                                $push: {
                                    "surveyId": '$surveyId',
                                    "departmentId": '$departmentId'
                                }
                            }
                        }
                    }
                },
                {
                    $match: { '_id': { $not: { $eq: 'olders' }, } }
                },
                {
                    $unwind: { path: "$takenSurveys" }
                },
                {
                    $project: {
                        "surveyId": "$takenSurveys.surveyId",
                        "departmentId": "$takenSurveys.departmentId"
                    }
                },
                {
                    $group: {
                        _id: {
                            period: "$_id",
                            surveyId: "$surveyId",
                            departmentId: "$departmentId"
                        },
                    }
                },
                {
                    $project: {
                        "_id": 0,
                        "period": "$_id.period",
                        "surveyId": "$_id.surveyId",
                        "departmentId": "$_id.departmentId"
                    }
                },
                {
                    $group: {
                        _id: {
                            period: "$period",
                            departmentId: "$departmentId"
                        },
                        taken: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        "_id": 0,
                        "period": "$_id.period",
                        "departmentId": "$_id.departmentId",
                        "taken": 1,
                    }
                }
            ];

            const givenAnswersPipeline = [
                {
                    $match: {
                        companyId,
                        skipped: { $exists: false }
                    }
                },
                {
                    $bucket: {
                        groupBy: '$date',
                        boundaries,
                        default: 'olders',
                        output: {
                            "givenAnswers": {
                                $push: {
                                    "departmentId": '$departmentId'
                                }
                            }
                        }
                    }
                },
                {
                    $match: { '_id': { $not: { $eq: 'olders' }, } }
                },
                {
                    $unwind: { path: "$givenAnswers" }
                },
                {
                    $project: {
                        "departmentId": "$givenAnswers.departmentId"
                    }
                },
                {
                    $group: {
                        _id: {
                            period: "$_id",
                            departmentId: "$departmentId"
                        },
                        givenAnswers: { $count: {} }
                    }
                },
                {
                    $project: {
                        "_id": 0,
                        "givenAnswers": 1,
                        "period": "$_id.period",
                        "departmentId": "$_id.departmentId"
                    }
                }

            ]

            const reportPipeline = [
                { $match: { companyId } },
                {
                    $project: {
                        _id: 1,
                        period: boundaries.slice(0, -1),
                    }
                },
                {
                    $unwind: {
                        path: "$period"
                    }
                },
                this.joinPipeline('Surveys', generatedSurveysPipeline, 'generated'),
                this.joinPipeline('SurveyResults', takenSurveysPipeline, 'taken'),
                this.joinPipeline('SurveyResults', givenAnswersPipeline, 'givenAnswers'),
                {
                    $unwind: {
                        path: "$generated",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$taken",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$givenAnswers",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        "departmentId": "$_id",
                        "_id": 0,
                        "period": 1,
                        "generated": "$generated.generated",
                        "taken": "$taken.taken",
                        "givenAnswers": "$givenAnswers.givenAnswers"
                    }
                }
            ]

            const result = await this.db.collection('Departments').aggregate(
                reportPipeline
            ).toArray() as IReportPassStaticticRecord[];

            return {
                periods: boundaries.slice(0, -1),
                records: result
            }

        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    private joinPipeline(collectionName: string, pipeline: Array<any>, asFieldName: string) {
        return {
            $lookup: {
                from: collectionName,
                let: {
                    departmentId: "$_id",
                    period: "$period"
                },
                as: asFieldName,
                pipeline: [
                    ...pipeline,
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$$period", "$period"] },
                                    { $eq: ["$$departmentId", "$departmentId"] },
                                ]
                            }
                        }
                    }
                ]
            }
        }
    }

}