import { Scopes } from "../models/user.model.js"
import { TObjectId, IEntityManager, TWithId } from "./common.model.js"

export enum SignUpStatus {
    NotInvitedYet = 'NotInvitedYet',
    Invited = 'Invited',
    SingedUp = 'SignedUp'
}

export interface IRespondent {
    companyId: TObjectId
    firstName: string,
    lastName: string,
    middleName?: string,
    email: string,
    birthDate?: Date,
    departmentId?: TObjectId,
    position?: string,
    isRemote?: boolean,
    isActive?: boolean,
    doSendSurveys?: boolean,
    scope?: Scopes,
    signUpStatus?: SignUpStatus,
}

export type TRespondentRequired = Pick<IRespondent, 'firstName' | 'lastName' | 'email' | 'companyId'>

export interface IRespondentManager extends IEntityManager<IRespondent/* , TRespondentRequired */> { 
    /* issueSignupToken(_id: TObjectId): Promise<true>; */
}