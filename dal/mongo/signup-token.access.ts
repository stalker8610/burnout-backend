import { ISignupToken, ISignupTokenManager } from '../../models/signup-token.model.js';
import { MongoClient } from "mongodb";
import { TObjectId, TWithId } from "../../models/common.model.js";
import { EntityManager } from "./common.access.js";
import { errorMessage } from '../../util/util.js';
import { RespondentManager } from './respondent.access.js';
import { IRespondentManager, IRespondent, SignUpStatus } from '../../models/respondent.model.js';
import serverConfig from '../../server.config.json' assert { type: "json"};

import { sendInviteEmail } from '../../util/email-sender.js';

export class SingupTokenManager extends EntityManager<ISignupToken/* , TUserRequired */> implements ISignupTokenManager {

    private respondentManager: IRespondentManager;
    constructor(dbClient: MongoClient) {
        super(dbClient, 'IssuedSignupTokens');
        this.respondentManager = new RespondentManager(dbClient);
    }

    async issueToken(data: ISignupToken, inviterId: TObjectId<IRespondent>): Promise<TWithId<ISignupToken>> {
        try {
            const result = await this.create(data);
            const respondent = await this.respondentManager.findById(data.respondentId);
            const inviter = await this.respondentManager.findById(inviterId);
            
            const params = {
                userName: respondent.firstName || respondent.lastName,
                inviterName: `${inviter.lastName || ''} ${inviter.firstName || ''}`.trim(),
                signUpLink: `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}/auth/signup/${result._id}`,
                toEmail: respondent.email
            }

            await sendInviteEmail(params);
            await this.respondentManager.update(data.respondentId, { signUpStatus: SignUpStatus.Invited });
            return result;
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
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