import { ISignupToken, ISignupTokenManager } from '../../models/token.model.js';
import { MongoClient, ObjectId } from "mongodb";
import { TObjectId, TWithId } from "../../models/common.model.js";
import { EntityManager } from "./common.access.js";

export class SingupTokenManager extends EntityManager<ISignupToken/* , TUserRequired */> implements ISignupTokenManager {

    constructor(dbClient: MongoClient) {
        super(dbClient, 'IssuedSignupTokens');
    }

/*     async isTokenValid(token: ISignupToken['token']): Promise<ISignupToken> {
        try {
            return await this.collection.findOne({ token });
            throw `Token ${data.token} is invalid`;
        } catch (e) {
            return Promise.reject(e);
        }
    } */

    /* async issueToken({ respondentId }: Pick<ISignupToken, 'respondentId'>): Promise<TWithId<ISignupToken>> {
        return this.create({
            respondentId,
            token: new ObjectId().toHexString()
        })
    } */

}