import { MongoClient } from "mongodb";
import { IRespondent, IRespondentManager } from "../../models/respondent.model.js";
import { EntityManager } from "./common.access.js";
import { TWithId } from "../../models/common.model.js";
import { errorMessage } from '../../util/util.js';

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
                /* const newObjId = (await this.collection.insertOne(data)).insertedId.toHexString();
                return this.findById(newObjId); */
                return super.create(data);
                //return (await this.collection.insertOne(data)).insertedId.toHexString();
            }
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

}