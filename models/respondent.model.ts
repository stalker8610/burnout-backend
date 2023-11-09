import { Scopes } from "../models/user.model.js"
import { TObjectId, IEntityManager, TWithId, IWithCompanyId } from "./common.model.js"
import { ICompany } from "./company.model.js"
import { IDepartment } from "./department.model.js"

export enum SignUpStatus {
    NotInvitedYet = 'NotInvitedYet',
    Invited = 'Invited',
    SingedUp = 'SignedUp'
}

export interface IRespondent extends IWithCompanyId  {
    firstName: string,
    lastName: string,
    middleName?: string,
    email: string,
    birthDate?: Date,
    departmentId?: TObjectId<IDepartment>,
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