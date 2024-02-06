import { MongoClient } from 'mongodb';
import dbConfig from './db.config.json' assert { type: "json"};

const uri = `mongodb://${dbConfig.userName}:${dbConfig.password}@${dbConfig.server}:${dbConfig.port}/burnout?authSource=${dbConfig.authSource}`;
export const getDbClient = () => {
    console.log(uri);
    const dbClient = new MongoClient(uri);
    const dbClientPromise = dbClient.connect();
    return { dbClient, dbClientPromise }
}

export const closeDbClient = (dbClient: MongoClient) => {
    return dbClient.close();
}

export const dbName = dbConfig.dbName;