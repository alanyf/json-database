const Database = require('./index.js');
// 使用样例
const tableName1 = 'table_name_1';
const tableTemplate1 = {
    "index": 0,
    "name": '',
    "age": 0,
    "sex": ''
}
const DB = new Database();
const table1 = DB.addTable(tableName1, tableTemplate1);


const table1_add1 = table1.add(tableTemplate1);
console.log('table1_add1:', table1_add1);

const table1_add2 = table1.add([tableTemplate1, {index: 1}, {index: 2, name: 'alan'}]);
console.log('table1_add2:', table1_add2);

const table1_del = table1.del({index: 1});
console.log('table1_del:', table1_del);

const table1_update = table1.update({index: 0}, {age: 24});
console.log('table1_update:', table1_update);

const table1_search = table1.search({index: 0});
console.log('table1_search:', table1_search);


const tableName2 = 'table_name_2';
const tableTemplate2 = {
    "id": 0,
    "time": '',
    "size": 0,
    "price": 0
}


const table2 = DB.addTable(tableName2, tableTemplate2);

const table2_add1 = table2.add(tableTemplate2);
console.log('table2_add1:', table2_add1);

const table2_add2 = table2.add([tableTemplate2, {id: 1}, {id: 2, price: '40'}]);
console.log('table2_add2:', table2_add2);

const table2_del = table2.del({id: 1});
console.log('table2_del:', table2_del);

const table2_update = table2.update({id: 0}, {size: 90});
console.log('table2_update:', table2_update);

const table2_search = table2.search({id: 0});
console.log('table2_search:', table2_search);