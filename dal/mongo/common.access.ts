import { ObjectId, MongoClient, Collection, Db, Filter, OptionalId, OptionalUnlessRequiredId, WithId } from "mongodb";
import { TObjectId } from "../../models/common.model.js";
import { IEntityManager, type TWithId, IWithCompanyId } from "../../models/common.model.js";
import { dbName } from "./core.access.js";
import { errorMessage } from '../../util/util.js';
import { ICompany } from "../../models/company.model.js";

export class EntityManager<T/* , RequiredT */> implements IEntityManager<T/* , RequiredT */>{

    protected readonly db: Db;
    protected readonly collection: Collection<OptionalId<T>>;

    private cache = <Array<TWithId<T>>>[];

    constructor(protected readonly dbClient: MongoClient,
        private readonly collectionName: string) {

        this.db = this.dbClient.db(dbName);
        this.collection = this.db.collection(this.collectionName);

    }

    async create(data: T): Promise<TWithId<T>> {
        try {
            const _id = new ObjectId().toHexString();
            const dataWithId = {
                ...data,
                _id
            }
            await this.collection.insertOne(<OptionalUnlessRequiredId<OptionalId<T>>>dataWithId);
            return this.findById(_id);
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    async findById(_id: TObjectId<T>): Promise<TWithId<T>> {
        try {
            let result = this.cache.find(el => el._id === _id);
            if (!result) {
                result = this.changeIdType(await this.collection.findOne(this.idFilter(_id)));
                if (result) {
                    this.cache.push(result);
                } else {
                    throw `Object with _id ${_id} not found`;
                }
            }
            return result;
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    async update(_id: TObjectId<T>, data: Partial<OptionalId<T>>): Promise<TWithId<T>> {
        const dataToUpdate = Object.assign({}, data);
        delete dataToUpdate._id;
        try {
            const updateResult = await this.collection.updateOne(this.idFilter(_id), { $set: { ...dataToUpdate } });
            if (!updateResult.matchedCount) {
                throw `Object with _id ${_id} not found`;
            }
            if (updateResult.modifiedCount === 1) {
                const index = this.cache.findIndex(el => el._id === _id);
                if (index !== -1) {
                    this.cache.splice(index, 1);
                }
            }
            return this.findById(_id);
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    async delete(_id: TObjectId<T>): Promise<true> {
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
            return Promise.reject(errorMessage(e));
        }
    }

    async getAll(): Promise<TWithId<T>[]> {
        try {
            const result = await this.collection.find().toArray();
            return result.map(el => this.changeIdType(el));
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

    protected changeIdType(entity: WithId<OptionalId<T>>): TWithId<T> {
        return entity as TWithId<T>;
    }

    private idFilter(_id) {
        return { _id } as Filter<OptionalId<T>>;
    }

}

export class CompanyRelatedEntityManager<T extends IWithCompanyId> extends EntityManager<T> {

    constructor(dbClient: MongoClient, collectionName: string) {
        super(dbClient, collectionName);
    }

    async getAllByCompany(companyId: TObjectId<ICompany>): Promise<TWithId<T>[]> {
        try {
            const filter = { companyId } as any;
            const result = await this.collection.find(filter).toArray();
            return result.map(el => this.changeIdType(el));
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }
    }

}