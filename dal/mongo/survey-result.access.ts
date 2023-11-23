import { MongoClient } from "mongodb";
import { EntityManager } from "./common.access.js";
import { ISurveyResult, ISurveyResultManager, ISurveyResultConfirmedAnswer, ISurveyResultSkippedQuestion } from "../../models/survey-result.model.js";
import { RespondentManager } from "./respondent.access.js";
import { TObjectId, TWithId } from "../../models/common.model.js";
import { SurveyManager } from "./survey.access.js";
import { errorMessage } from "../../util/util.js";
import { ISurvey } from "../../models/survey.model.js";

import { SurveyProgressManager } from "./survey-progress.access.js";


export class SurveyResultManager extends EntityManager<ISurveyResult> implements ISurveyResultManager {

    private respondentManager: RespondentManager;
    private surveyManager: SurveyManager;
    private surveyProgressManager: SurveyProgressManager;

    constructor(dbClient: MongoClient) {
        super(dbClient, 'SurveyResults');
        this.respondentManager = new RespondentManager(dbClient);
        this.surveyManager = new SurveyManager(dbClient);
        this.surveyProgressManager = new SurveyProgressManager(this.dbClient);
    }

    override async create(data: ISurveyResult): Promise<TWithId<ISurveyResult>> {
        try {

            const survey = await this.surveyManager.findById(data.surveyId);
            const respondent = await this.respondentManager.findById(survey.respondentId);

            const dataToSave = {
                ...data,
                companyId: respondent.companyId,
                departmentId: respondent.departmentId,
            }

            if (!('anonymous' in data) || !data.anonymous) {
                dataToSave['respondentId'] = respondent._id;
            }

            const entity = super.create(dataToSave);
            this.surveyProgressManager.makeProgress(data.surveyId);
            return entity;

        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    async confirmAnswer(surveyId: TObjectId<ISurvey>, data: ISurveyResultConfirmedAnswer): Promise<true> {
        try {
            const entity = {
                surveyId,
                questionId: data.questionId,
                date: new Date(),
                answer: data.answer,
                anonymous: data.anonymous
            }

            if (!entity.anonymous) {
                delete entity.anonymous
            }

            this.create(entity);
            return true;

        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    async skipQuestion(surveyId: TObjectId<ISurvey>, data: ISurveyResultSkippedQuestion): Promise<true> {
        try {
            const survey = await this.surveyManager.findById(surveyId);
            const entity: ISurveyResultSkippedQuestion = {
                surveyId,
                questionId: data.questionId,
                date: new Date(),
                skipped: true
            }
            await this.create(entity);
            return true;
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

}
