import { IEntityManager, TObjectId, TWithId } from "./common.model.js"
import { IDepartment } from "./department.model.js";
import { IRespondent } from "./respondent.model.js";
import { IQuestion, ISurvey } from "./survey.model.js"
import { ICompany } from "./company.model.js";

export enum SelfMood {
    Sad,
    Neutral,
    Happy
}

export enum PersonalFeedbackMood {
    Angry,
    Sad,
    Happy,
    Happier,
    Happiest
}

export type TQuestionConfirmedAnswer = {
    questionId: TObjectId<IQuestion>,
    anonymous?: true,
    answer: any
}

export type TQuestionSkipped = {
    questionId: TObjectId<IQuestion>
}

type TAnswerCompany = {
    score: number
}

type TAnswerPersonal = { feedbackTo: TObjectId<IRespondent> } &
    ({ newcomer: true } |
    {
        mood?: PersonalFeedbackMood,
        text?: string
    })

type TAnswerTeamAssertBoolean = { respondentId: TObjectId<IRespondent>, is: boolean }[]

type TAnswerTeamAssertCheckbox = { respondentId: TObjectId<IRespondent>, is: true }[]

type TAnswerWall = {
    mood?: SelfMood,
    text?: string
}

type TAnswer = TAnswerWall | TAnswerPersonal | TAnswerCompany | TAnswerTeamAssertBoolean | TAnswerTeamAssertCheckbox;

interface ISurveyResultBasic {
    surveyId: TObjectId<ISurvey>,
    questionId: TObjectId<IQuestion>,
    date: Date
}

export interface ISurveyResultSkippedQuestion extends ISurveyResultBasic {
    skipped: true,
}

export interface ISurveyResultConfirmedAnswer extends ISurveyResultBasic {
    anonymous?: true,
    answer: TAnswer
}

export type ISurveyResult = ISurveyResultSkippedQuestion | ISurveyResultConfirmedAnswer

export interface ISurveyResultManager extends IEntityManager<ISurveyResult> {
    confirmAnswer(surveyId: TObjectId<ISurvey>, data: ISurveyResultConfirmedAnswer): Promise<true>;
    skipQuestion(surveyId: TObjectId<ISurvey>, data: ISurveyResultSkippedQuestion): Promise<true>;
}

