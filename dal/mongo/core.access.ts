import { MongoClient } from 'mongodb';
import dbConfig from './db.config.json' assert { type: "json"};

const uri = `mongodb://${dbConfig.userName}:${dbConfig.password}@${dbConfig.server}:${dbConfig.port}/burnout?authSource=${dbConfig.authSource}`;
export const dbClient = new MongoClient(uri);
export const dbClientPromise = dbClient.connect();

export const dbCloseConnection = () => {
    return dbClient.close();
}

export const dbName = dbConfig.dbName;