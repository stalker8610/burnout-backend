import { ISurvey } from './survey.model.js';
import { TObjectId, TWithId, IEntityManager } from './common.model.js';


export interface ISurveyProgress {
    surveyId: TObjectId<ISurvey>,
    progress: number
}

export interface ISurveyProgressManager extends IEntityManager<ISurveyProgress> {
    findBySurveyId(surveyId: TObjectId<ISurvey>): Promise<TWithId<ISurveyProgress>>;
    getSurveyProgress(surveyId: TObjectId<ISurvey>): Promise<number>;
    makeProgress(surveyId: TObjectId<ISurvey>): Promise<true>;
}