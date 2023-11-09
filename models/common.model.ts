import { OptionalId } from "mongodb";
import { ICompany } from "./company.model.js";

// HEX string of 24 bytes
export type TObjectId<T> = string;

export type TWithId<T> = T & {
    _id: TObjectId<T>
}

export interface IWithCompanyId {
    companyId: TObjectId<ICompany>
}

export interface IEntityManager<T/* , RequiredT */> {
    //create(data: Partial<T> & RequiredT): Promise<TObjectId>;
    //create(data: Partial<T> & RequiredT): Promise<TWithId<T>>;
    create(data: T): Promise<TWithId<T>>;
    findById(_id: TObjectId<T>): Promise<TWithId<T>>;
    //update(_id: TObjectId, data: Partial<T>): Promise<TWithId<T>>;
    update(_id: TObjectId<T>, data: Partial<OptionalId<T>>): Promise<TWithId<T>>;
    delete(_id: TObjectId<T>): Promise<true>;
    getAll(): Promise<TWithId<T>[]>
}