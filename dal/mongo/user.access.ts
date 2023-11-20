import { MongoClient, ObjectId } from "mongodb";
import crypto from 'crypto';
import { IUser, /* TUserRequired,  */IUserManager } from "../../models/user.model.js";
/* import { projectIdOptions } from "./core.access.js"; */
import { TObjectId, TWithId } from "../../models/common.model.js";
import { EntityManager } from "./common.access.js";
import { IRespondent } from "../../models/respondent.model.js";
import { errorMessage } from '../../util/util.js';

export class UserManager extends EntityManager<IUser/* , TUserRequired */> implements IUserManager {

    constructor(dbClient: MongoClient) {
        super(dbClient, 'Users');
    }

    findByEmail(email: string): Promise<TWithId<IUser>> {
        return this.collection.findOne({ email }/* , projectIdOptions */) as unknown as Promise<TWithId<IUser>>;
    }

    async createUser(data: IUser/* TUserRequired */ & { password: string }): Promise<TWithId<IUser>> {
        //async createUser(data: TUserRequired & { password: string }): Promise<TObjectId> {
        try {
            if (await this.collection.findOne({ email: data.email })) {
                throw `User with email ${data.email} already exists`;
            } else {
                const salt = crypto.randomBytes(16);
                const newUserData = Object.assign({},
                    data,
                    {
                        salt,
                        hashed_password: crypto.pbkdf2Sync(data.password, salt, 310000, 32, 'sha256')
                    });
                delete newUserData.password;
                return this.create(newUserData);
            }
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    checkPassword(user: IUser, password: string) {
        const hashed_password = crypto.pbkdf2Sync(password, Buffer.from(user.salt.buffer), 310000, 32, 'sha256');
        return crypto.timingSafeEqual(Buffer.from(user.hashed_password.buffer), hashed_password);
    }

    async findByRespondentId(id: TObjectId<IRespondent>): Promise<TWithId<IUser>> {
        try {
            const result = await this.collection.findOne({ respondentId: id }) as unknown as Promise<TWithId<IUser>>;
            if (!result) {
                throw `User with respondentId=${id} not found`;
            }
            return result;
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

}