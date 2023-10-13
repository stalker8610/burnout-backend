import { MongoClient, ObjectId } from "mongodb";
import { IRespondent, TRespondentRequired, IRespondentManager } from "../../models/respondent.model.js";
import { EntityManager } from "./common.access.js";
import { TObjectId, TWithId } from "../../models/common.model.js";

export class RespondentManager extends EntityManager<IRespondent/* , TRespondentRequired */> implements IRespondentManager {

    constructor(dbClient: MongoClient) {
        super(dbClient, 'Respondents');
    }

    //override async create(data: Partial<IRespondent> & TRespondentRequired): Promise<TObjectId> {
    override async create(data: IRespondent/* Partial<IRespondent> & TRespondentRequired */): Promise<TWithId<IRespondent>> {
        try {
            if (await this.collection.findOne({ email: data.email })) {
                throw `Respondent with email ${data.email} already exists`;
            } else {
                const newObjId = (await this.collection.insertOne(data)).insertedId.toHexString();
                return this.findById(newObjId);
                //return (await this.collection.insertOne(data)).insertedId.toHexString();
            }
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /* async issueSignupToken(_id: TObjectId): Promise<true> {
        try {
            const respondent = await this.findById(_id);
            if (!respondent) {
                throw `Respondent with _id ${_id} not found`;
            }
            if ((await this.db.collection('IssuedSignupTokens').updateOne(
                { email: respondent.email },
                { token: new ObjectId() },
                { upsert: true })).modifiedCount === 1) {
                return true;
            };
            throw `Unable to issue new singup token for respondent ${_id}`;

        } catch (e) {
            return Promise.reject(e);
        }
    } */



}