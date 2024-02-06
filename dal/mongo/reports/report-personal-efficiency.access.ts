import { ICompany } from '../../../models/company.model.js';
import { TObjectId } from '../../../models/common.model.js';
import { type MongoClient, type Db } from "mongodb";
import {
    IReportPersonalEfficiencyRecord,
    IReportPersonalEfficiencyResponse,
    IReportPersonalEfficiencyManager
} from "../../../models/reports/report-personal-efficiency.model.js";
import { dbName } from "../core.access.js";
import { errorMessage } from '../../../util/util.js';
import { IRespondent } from '../../../models/respondent.model.js';


export class ReportPersonalEfficiencyManager implements IReportPersonalEfficiencyManager {

    protected readonly db: Db;

    constructor(protected readonly dbClient: MongoClient) {
        this.db = this.dbClient.db(dbName);
    }

    async getRecords(companyId: TObjectId<ICompany>, respondentId: TObjectId<IRespondent>): Promise<IReportPersonalEfficiencyResponse> {
        try {
            const result = await this.db
                .collection('Respondents')
                .aggregate<IReportPersonalEfficiencyRecord>([
                    { $match: { companyId, _id: respondentId } },
                    {
                        $lookup: {
                            from: 'Questions',
                            as: 'questions',
                            pipeline: [
                                { $match: { type: 'personal' } },
                                {
                                    $project: {
                                        '_id': 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $project: {
                            'questionId': {
                                $getField: {
                                    field: '_id',
                                    input: { $first: "$questions" }
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'SurveyResults',
                            let: {
                                respondentId: "$_id",
                                questionId: "$questionId"
                            },
                            as: 'rates',
                            pipeline: [
                                {
                                    $match: {
                                        companyId,
                                        $expr: {
                                            $and: [
                                                { $eq: ["$$questionId", "$questionId"] },
                                                { $eq: ["$$respondentId", "$answer.feedbackTo"] },
                                            ]
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        "_id": 0,
                                        "mood": "$answer.mood",
                                        "text": "$answer.text"

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $match: {
                            $expr: { $gt: [{ $size: "$rates" }, 0] }
                        }
                    },
                    {
                        $project: {
                            "_id": 0,
                            "respondentId": "$_id",
                            "rates": 1
                        }
                    }
                ]).toArray();

            return result[0];

        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

}