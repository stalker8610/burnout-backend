import { TObjectId, IEntityManager, type TWithId } from "./common.model.js"

export enum Scopes {
    Admin = 'Admin',
    HR = 'HR',
    User = 'User'
}

export interface IUser {
    email: string,
    scope: Scopes,
    salt?: Buffer,
    hashed_password?: Buffer,
    respondentId?: TObjectId,
    companyId?: TObjectId
}



/* export type TUserRequired = Pick<IUser, 'email' | 'scope' | 'respondentId' | 'companyId'>; */

export interface IUserManager extends IEntityManager<IUser/* , TUserRequired */> {
    findByEmail(email: string): Promise<TWithId<IUser>>;
    //createUser(data: TUserRequired & { password: string }): Promise<TObjectId>;
    //createUser(data: TUserRequired & { password: string }): Promise<TWithId<IUser>>;
    //signUp(respondentId: TObjectId, token: TObjectId, password: string): Promise<TWithId<IUser>>;
    createUser(data: IUser & { password: string }): Promise<TWithId<IUser>>;
    checkPassword(user: IUser, password: string): boolean;
}