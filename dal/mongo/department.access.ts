import { type MongoClient } from "mongodb";
import { IDepartment, IDepartmentManager } from "../../models/department.model.js";
import { EntityManager } from "./common.access.js";

export class DepartmentManager extends EntityManager<IDepartment> implements IDepartmentManager {

    constructor(dbClient: MongoClient) {
        super(dbClient, 'Departments');
    }

}