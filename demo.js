const Database = require('./index.js');
const DB = new Database();

const tableName = 'cat';
const tableTemplate = {
    "index": 0,
    "name": '',
    "age": 0,
    "sex": ''
}

async function run(){
    const table = await DB.addTable(tableName, tableTemplate);
    
    const table_add1 = await table.add(tableTemplate);
    console.log('add1:', table_add1);
    
    const table_add2 = await table.add([tableTemplate, {index: 1}, {index: 2, name: 'alan'}, {index: 3}, {index: 4}, {index: 5}, {index: 6}, {index: 7}, {index: 8}]);
    console.log('add2:', table_add2);
    
    const table_del = await table.del({index: 8});
    console.log('del:', table_del);
    
    const table_update = await table.update({index: 2}, {age: 24});
    console.log('update:', table_update);
    
    const table_search = await table.search({index: 1});
    console.log('search:', table_search);

}
run();
