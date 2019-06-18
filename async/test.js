const fs = require('./fs.async.js');
const path = require('path');

async function run(){
    const dataPath =  path.resolve(__dirname, '../.data/tables.json');
    const file = await fs.readFile(dataPath);
    console.log(file.toString());
}

run();