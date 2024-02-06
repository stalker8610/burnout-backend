import { IQuestion, IQuestionManager } from "../../models/question.model.js";
import { EntityManager } from "./common.access.js";
import type { MongoClient } from "mongodb";

export class QuestionManager extends EntityManager<IQuestion> implements IQuestionManager {
    constructor(dbClient: MongoClient) {
        super(dbClient, 'Questions');
    }
}

