import { MongoClient } from "mongodb";
import { ISurvey, ISurveyManager, IQuestion, TQuestionType } from "../../models/survey.model.js";
import { TObjectId, TWithId } from "../../models/common.model.js";
import { CompanyRelatedEntityManager, EntityManager } from "./common.access.js";
import { errorMessage } from '../../util/util.js';
import { IRespondent } from "../../models/respondent.model.js";
import { ICompany } from "../../models/company.model.js";


export class SurveyManager extends EntityManager<ISurvey> implements ISurveyManager {

    private questionsCache: Partial<Record<TQuestionType, TWithId<IQuestion>[]>> = {};

    constructor(dbClient: MongoClient) {
        super(dbClient, 'Surveys');
    }

    override async findById(_id: TObjectId<ISurvey>): Promise<TWithId<ISurvey>> {
        try {
            const result = await super.findById(_id);
            const questionEntityManager = new EntityManager<IQuestion>(this.dbClient, 'Questions');
            const questionBodies = await Promise.all(
                result.questions.map((question: TWithId<{}>) => questionEntityManager.findById(question._id))
            );

            questionBodies.forEach((question: TWithId<IQuestion>, index) => {
                result.questions[index] = question;
            });

            return result;
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    async generateSurvey(respondentId: TObjectId<IRespondent>, companyId: TObjectId<ICompany>): Promise<TWithId<ISurvey>> {

        let teammate: TWithId<IRespondent>;
        try {
            teammate = await this.pickTeammate(companyId, respondentId);
        } catch (e) {
            console.log(e);
        }

        const now = new Date();
        const oneWeekLater = new Date(now);
        oneWeekLater.setDate(oneWeekLater.getDate() + 7); //have 7 days to complete survey

        const survey: ISurvey = {
            respondentId,
            feedbackToId: teammate?._id,
            createdAt: now,
            expiredAt: oneWeekLater,
            questions: (await this.pickQuestions()).map((el: TWithId<IQuestion>) => ({ _id: el._id }))
        }

        return this.create(survey);

    }

    private async pickQuestions(): Promise<TWithId<IQuestion>[]> {

        if (!Object.getOwnPropertyNames(this.questionsCache).length) {
            await this.loadQuestions();
        }

        //take 1 'wall' question
        //take 5 random questions of type 'checkbox' | 'boolean'
        //take 3 random questions of type 'company'
        //take 1 random question about random teammate

        return this.getRandomQuestions(['wall'], 1)
            .concat(this.getRandomQuestions(['checkbox', 'boolean'], 5))
            .concat(this.getRandomQuestions('company', 3))
            .concat(this.getRandomQuestions('personal', 1));

    }


    private getRandomQuestions(filter: TQuestionType | TQuestionType[], amount: number): TWithId<IQuestion>[] {

        let arrayToPick: TWithId<IQuestion>[] = [];
        if (!Array.isArray(filter)) {
            filter = [filter];
        }

        filter.forEach((type: TQuestionType) => arrayToPick = arrayToPick.concat(this.questionsCache[type]));

        let pickedItems: TWithId<IQuestion>[] = [];
        let pickedCount = 0;

        while (pickedCount < amount) {
            const item = arrayToPick[Math.floor(Math.random() * arrayToPick.length)];
            if (!pickedItems.includes(item)) {
                pickedItems.push(item);
                pickedCount++;
            }
        }

        return pickedItems;

    }

    private async loadQuestions() {
        const questionEntityManager = new EntityManager<IQuestion>(this.dbClient, 'Questions');
        try {
            const allQuestions = await questionEntityManager.getAll();
            const types: TQuestionType[] = ['company', 'personal', 'boolean', 'checkbox', 'wall'];
            types.forEach(type => this.questionsCache[type] = allQuestions.filter(el => el.type === type));
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    private async pickTeammate(companyId: TObjectId<ICompany>, excludeId: TObjectId<IRespondent>): Promise<TWithId<IRespondent>> {
        const respondentManager = new CompanyRelatedEntityManager<IRespondent>(this.dbClient, 'Respondents');
        try {
            const allTeammates = await respondentManager.getAllByCompany(companyId);
            if (allTeammates.length === 1) {
                throw `There aren't any teammates to give feedback in company ${companyId}`;
            }
            let teammate: TWithId<IRespondent>;
            do {
                teammate = allTeammates[Math.floor(Math.random() * allTeammates.length)];
            } while (teammate._id === excludeId);

            return teammate;
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    async completeSurvey(surveyId: TObjectId<ISurvey>): Promise<true> {
        try {
            await this.update(surveyId, { finishedAt: new Date() });
            return true;
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    

}