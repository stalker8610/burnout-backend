import { TObjectId } from "../models/common.model.js"

export enum QuestionTypes {
    AboutUserTrueFalse = 'aboutUserTrueFalse',
    AboutUserCheckbox = 'aboutUserCheckbox',
    AboutCompany = 'aboutCompany'
}

export interface IQuestionCategory {
    title: string
}

export interface IQuestion {
    title: string,
    type: QuestionTypes,
    categoryId: TObjectId
}

export interface ISurvey {
    questionIds: TObjectId[]
}

export interface ISurveyResult {
    surveyId: TObjectId,
    userId: TObjectId,
    date: Date
}