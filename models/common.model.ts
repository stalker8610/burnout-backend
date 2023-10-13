import { Document } from "mongodb";

// HEX string of 24 bytes
export type TObjectId = string;

export type TWithId<T> = T & {
    _id: TObjectId
}

export type WithoutId<T> = Omit<T, '_id'>

export interface IEntityManager<T/* , RequiredT */> {
    //create(data: Partial<T> & RequiredT): Promise<TObjectId>;
    //create(data: Partial<T> & RequiredT): Promise<TWithId<T>>;
    create(data: T): Promise<TWithId<T>>;
    findById(_id: TObjectId): Promise<TWithId<T>>;
    //update(_id: TObjectId, data: Partial<T>): Promise<TWithId<T>>;
    update(_id: TObjectId, data: T): Promise<TWithId<T>>;
    delete(_id: TObjectId): Promise<true>;
    getAll(): Promise<TWithId<T>[]>
}