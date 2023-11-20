import { MongoClient } from "mongodb";
import { IRespondent, IRespondentManager, SignUpStatus } from "../../models/respondent.model.js";
import { EntityManager } from "./common.access.js";
import { TWithId, TObjectId } from "../../models/common.model.js";
import { errorMessage } from '../../util/util.js';
import { IUserManager } from "../../models/user.model.js";
import { UserManager } from "./user.access.js";

export class RespondentManager extends EntityManager<IRespondent> implements IRespondentManager {

    userEntityManager: IUserManager;

    constructor(dbClient: MongoClient) {
        super(dbClient, 'Respondents');
        this.userEntityManager = new UserManager(dbClient);
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
            const user = await this.userEntityManager.findByRespondentId(respondentId);
            await this.userEntityManager.update(user._id, { disabled: true });
            await this.update(respondentId, { signUpStatus: SignUpStatus.Disabled });
            return this.findById(respondentId);
        } catch (e) {
            return Promise.reject(errorMessage(e))
        }
    }

}