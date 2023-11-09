import * as fs from 'fs';
import { ObjectId } from 'mongodb';


var obj = JSON.parse(fs.readFileSync('questions.json'));
obj = obj.map(element => ({
    ...element,
    _id: new ObjectId().toHexString()
}));

fs.writeFileSync('questions-id.json', JSON.stringify(obj));