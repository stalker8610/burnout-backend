import { type MongoClient } from "mongodb";
import { IRespondent, IRespondentManager, SignUpStatus } from "../../models/respondent.model.js";
import { EntityManager } from "./common.access.js";
import { TWithId, TObjectId } from "../../models/common.model.js";
import { errorMessage } from '../../util/util.js';
import { IUserManager } from "../../models/user.model.js";


export class RespondentManager extends EntityManager<IRespondent> implements IRespondentManager {

    constructor(dbClient: MongoClient, private userManager: IUserManager) {
        super(dbClient, 'Respondents');
    }

    override async create(data: IRespondent): Promise<TWithId<IRespondent>> {
        try {
            if (await this.collection.findOne({ email: data.email })) {
                throw `Respondent with email ${data.email} already exists`;
            } else {
                data.signUpStatus = SignUpStatus.NotInvitedYet;
                return super.create(data);
            }
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    override async delete(_id: TObjectId<IRespondent>) {
        try {
            const respondent = await this.findById(_id);
            if (respondent.signUpStatus === SignUpStatus.SingedUp) {
                throw `Can't delete signed up user`;
            } else {
                return super.delete(_id);
            }
        } catch (e) {
            return Promise.reject(errorMessage(e))
        }
    }

    async deactivate(respondentId: TObjectId<IRespondent>): Promise<TWithId<IRespondent>> {
        try {
            const user = await this.userManager.findByRespondentId(respondentId);
            await this.userManager.update(user._id, { disabled: true });
            await this.update(respondentId, { signUpStatus: SignUpStatus.Disabled });
            return this.findById(respondentId);
        } catch (e) {
            return Promise.reject(errorMessage(e))
        }
    }

}