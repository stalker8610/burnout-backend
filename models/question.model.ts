import { IEntityManager } from "./common.model.js"
export type TQuestionType = 'wall' | 'company' | 'personal' | 'boolean' | 'checkbox'

export interface IQuestion {
    type: TQuestionType,
    title: string,
    category: string,
    inverted: boolean
}

export interface IQuestionManager extends IEntityManager<IQuestion> {}