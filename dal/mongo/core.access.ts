import { MongoClient/* , ObjectId */ } from 'mongodb';
import dbConfig from './db.config.json' assert { type: "json"};

/* export const projectIdOptions = {
    projection: {
        '_id': 0,
        '_id': '$_id'
    }
} */



const uri = `mongodb://${dbConfig.userName}:${dbConfig.password}@${dbConfig.server}:${dbConfig.port}/burnout?authSource=${dbConfig.authSource}`;
export const dbClient = new MongoClient(uri);
export const dbClientPromise = dbClient.connect();
/* 
export { ObjectId as TObjectId }; */

export const dbCloseConnection = () => {
    return dbClient.close();
}

export const dbName = dbConfig.dbName;