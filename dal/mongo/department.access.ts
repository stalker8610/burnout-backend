import { MongoClient } from "mongodb";
import { IDepartment, TDepartmentRequired, IDepartmentManager } from "../../models/department.model.js";
import { EntityManager } from "./common.access.js";

export class DepartmentManager extends EntityManager<IDepartment/* , TDepartmentRequired */> implements IDepartmentManager {

    constructor(dbClient: MongoClient) {
        super(dbClient, 'Departments');
    }

}