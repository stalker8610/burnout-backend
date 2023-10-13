import { ObjectId, MongoClient, Collection, Db/* , OptionalId, Document *//* , TWithId */, Filter, OptionalId, OptionalUnlessRequiredId, WithId } from "mongodb";
import { TObjectId } from "../../models/common.model.js";
import { IEntityManager, type TWithId } from "../../models/common.model.js";
import { dbName/* , projectIdOptions */ } from "./core.access.js";

export class EntityManager<T/* , RequiredT */> implements IEntityManager<T/* , RequiredT */>{

    protected readonly db: Db;
    protected readonly collection: Collection<OptionalId<T>>;

    private cache = <Array<TWithId<T>>>[];

    constructor(private readonly dbClient: MongoClient,
        private readonly collectionName: string) {

        this.collection = this.dbClient.db(dbName).collection(this.collectionName);
        this.db = this.dbClient.db(dbName);
    }

    //async create(data: Partial<T> & RequiredT): Promise<TWithId<T>> {
    async create(data: T): Promise<TWithId<T>> {
        //async create(data: Partial<T> & RequiredT): Promise<TObjectId> {
        try {
            const newObjId = (await this.collection.insertOne(<OptionalUnlessRequiredId<OptionalId<T>>>data)).insertedId.toHexString();
            return this.findById(newObjId);
            //return (await this.collection.insertOne(data)).insertedId.toHexString();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async findById(_id: TObjectId): Promise<TWithId<T>> {
        try {
            let result = this.cache.find(el => el._id === _id);
            if (!result) {
                result = this.changeIdType(await this.collection.findOne(this.idFilter(_id)/* , projectIdOptions */));
                if (result) {
                    this.cache.push(result);
                } else {
                    throw `Object with _id ${_id} not found`;
                }
            }
            return result;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    //async update(_id: TObjectId, data: TWithId<Partial<T>>): Promise<TWithId<T>> {
    async update(_id: TObjectId, data: TWithId<T>): Promise<TWithId<T>> {
        const dataToUpdate = Object.assign({}, data);
        delete dataToUpdate._id;
        try {
            const updateResult = await this.collection.updateOne(this.idFilter(_id), dataToUpdate);
            if (updateResult.modifiedCount === 1) {
                const index = this.cache.findIndex(el => el._id === _id);
                if (index !== -1) {
                    this.cache.splice(index, 1);
                }
                return this.findById(_id);
            }
            throw `Object with _id ${_id} not found`;
        } catch (e) {
            return Promise.reject(e);
        }

    }

    async delete(_id: TObjectId): Promise<true> {
        try {
            if ((await this.collection.deleteOne(this.idFilter(_id))).deletedCount === 1) {
                const index = this.cache.findIndex(el => el._id === _id);
                if (index !== -1) {
                    this.cache.splice(index, 1);
                }
                return true;
            }
            throw `Object with _id ${_id} not found`;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async getAll(): Promise<TWithId<T>[]> {
        try {
            return (await this.collection.find().toArray()).map(el => this.changeIdType(el));
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private changeIdType(entity: WithId<OptionalId<T>>): TWithId<T> {
        return entity && {
            ...entity,
            _id: entity._id.toHexString()
        } as TWithId<T>
    }

    private idFilter(_id) {
        return { _id: new ObjectId(_id) } as Filter<OptionalId<T>>;
    }

}