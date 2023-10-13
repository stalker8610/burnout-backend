import { TObjectId, IEntityManager, type TWithId } from "./common.model.js"
import { Scopes } from "./user.model.js"

export interface ISignupToken {
    respondentId: TObjectId,
    scope: Scopes,
    userId?: TObjectId //filled when user signed up with token
}

export interface ISignupTokenManager extends IEntityManager<ISignupToken> {

}