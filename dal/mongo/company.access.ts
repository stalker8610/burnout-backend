import { MongoClient } from "mongodb";
import { ICompany/* , TCompanyRequired */, ICompanyManager, ICompanyStructure } from "../../models/company.model.js";
import { TObjectId, TWithId } from "../../models/common.model.js";
import { EntityManager } from "./common.access.js";

export class CompanyManager extends EntityManager<ICompany/* , TCompanyRequired */> implements ICompanyManager {
    constructor(dbClient: MongoClient) {
        super(dbClient, 'Companies');
    }

    returnCompanyStructure(companyId: TObjectId): Promise<ICompanyStructure> {

        return Promise.resolve({});

        /* return this.db.collection('Departments').aggregate<TWithId<IRespondent>>([
            {
                "$match": { companyId }
            },
            {
                "$lookup": {
                    from: this.collection,
                    localField: '_id',
                    foreignField: 'departmentId',
                    as: 'respondents'
                }
            }
        ]).toArray(); */

    }
}