import { errorMessage } from './../../util/util.js';
import { type MongoClient } from "mongodb";
import { ICompany, ICompanyManager, ICompanyStructure } from "../../models/company.model.js";
import { EntityManager } from "./common.access.js";

export class CompanyManager extends EntityManager<ICompany> implements ICompanyManager {
    constructor(dbClient: MongoClient) {
        super(dbClient, 'Companies');
    }

    async getCompanyStructure(companyId: string): Promise<ICompanyStructure> {
        try {
            const result = await this.collection.aggregate([
                { $match: { _id: companyId } },
                {
                    $lookup: {
                        from: 'Departments',
                        localField: '_id',
                        foreignField: 'companyId',
                        as: 'departments',
                    }
                },
                {
                    $lookup: {
                        from: 'Respondents',
                        localField: '_id',
                        foreignField: 'companyId',
                        as: 'team',
                    }
                },
                {
                    $project: {
                        'team.companyId': 0,
                        'departments.companyId': 0
                    }
                }
            ]).toArray() as ICompanyStructure[];
            return result[0];
        } catch (e) {
            return Promise.reject(errorMessage(e));
        }

    }
}