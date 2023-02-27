import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export function getJSON(key) {
    const p = path.resolve(__dirname, "../ionconfig.json");
    if (fs.existsSync(p)) {
        const data = fs.readFileSync(p, 'utf8');
    
        const obj = JSON.parse(data);
        return obj[key]; 
    } else {
        fs.writeFileSync(p, JSON.stringify({"apath": "", "vpath": ""}));
        return null;
    }
}


export function setJSON(key, val) {
    return new Promise((resolve, reject) => {
        const p = path.resolve(__dirname, "../ionconfig.json");
        const data = fs.readFileSync(p, 'utf8');

        var obj = JSON.parse(data); //now it an object
        obj[`${key}`] = `${val}`; //add some data
        const json = JSON.stringify(obj); //convert it back to json
        fs.writeFileSync(p, json, (err) => {
            if (err) { return reject(err); }
            resolve();
        }); // write it back
    });
}