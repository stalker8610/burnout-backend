import { ISignupToken, ISignupTokenManager } from '../../models/token.model.js';
import { MongoClient, ObjectId } from "mongodb";
import { TObjectId } from "../../models/common.model.js";
import { EntityManager } from "./common.access.js";
import { errorMessage } from '../../util/util.js';

export class SingupTokenManager extends EntityManager<ISignupToken/* , TUserRequired */> implements ISignupTokenManager {

    constructor(dbClient: MongoClient) {
        super(dbClient, 'IssuedSignupTokens');
    }

    async validateToken(_id: TObjectId<ISignupToken>): Promise<ISignupToken> {
        try {
            const tokenData = await this.findById(_id)
            if (!tokenData) {
                throw `Token ${_id} is invalid`;
            }
            if (tokenData.userId) {
                throw `The token ${_id} has already been used`;
            }
            return tokenData;
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }
  
}