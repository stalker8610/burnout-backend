import { Scopes } from "../models/user.model.js"
import { TObjectId, IEntityManager, TWithId, IWithCompanyId } from "./common.model.js"
import { IDepartment } from "./department.model.js"

export enum SignUpStatus {
    NotInvitedYet = 'NotInvitedYet',
    Invited = 'Invited',
    SingedUp = 'SignedUp',
    Disabled = 'Disabled'
}

export interface IRespondent extends IWithCompanyId {
    firstName: string,
    lastName: string,
    middleName?: string,
    email: string,
    birthDate?: Date,
    departmentId?: TObjectId<IDepartment>,
    position?: string,
    isRemote?: boolean,
    doSendSurveys?: boolean,
    scope: Scopes,
    signUpStatus?: SignUpStatus,
}

export type TRespondentRequired = Pick<IRespondent, 'firstName' | 'lastName' | 'email' | 'companyId'>

export interface IRespondentManager extends IEntityManager<IRespondent> {
    deactivate(respondentId: TObjectId<IRespondent>): Promise<TWithId<IRespondent>>
}