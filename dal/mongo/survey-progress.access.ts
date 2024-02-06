import { type MongoClient } from "mongodb";
import { EntityManager } from "./common.access.js";
import { ISurveyProgress, ISurveyProgressManager } from "../../models/survey-progress.model.js";
import { TWithId } from "../../models/common.model.js";
import { errorMessage } from "../../util/util.js";

export class SurveyProgressManager extends EntityManager<ISurveyProgress> implements ISurveyProgressManager {

    constructor(dbClient: MongoClient) {
        super(dbClient, 'SurveyProgress');
    }

    async findBySurveyId(surveyId: string): Promise<TWithId<ISurveyProgress>> {
        try {
            return this.collection.findOne({ surveyId }) as unknown as TWithId<ISurveyProgress>;
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    async makeProgress(surveyId: string): Promise<true> {
        try {
            const record = await this.findBySurveyId(surveyId);
            if (record) {
                this.update(record._id, { progress: record.progress + 1 });
            } else {
                this.create({
                    surveyId,
                    progress: 1
                });
            }
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    async getSurveyProgress(surveyId: string): Promise<number> {
        try {
            const record = await this.findBySurveyId(surveyId);
            return record?.progress || 0
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

}
