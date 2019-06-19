const Database = require('./index.js');

// 使用样例
const tableName1 = 'table_name_1';
const tableName2 = 'table_name_2';
const tableName3 = 'table_name_3';
const tableTemplate1 = {
    "index": 0,
    "name": '',
    "age": 0,
    "sex": ''
}
const tableTemplate2 = {
    "id": 0,
    "time": '',
    "size": 0,
    "price": 0
}
const tableTemplate3 = {
    "display": 0,
    "position": '',
    "height": 0,
    "width": 0
}

const table1 = new Database(tableName1, tableTemplate1);

const addResult2 = table1.add([tableTemplate1, tableTemplate1]);
console.log('add:', addResult2);

const addResult3 = table1.add({
    "index": 1,
    "name": '',
    "age": 0,
    "sex": ''
});
console.log('add:', addResult3);

const table2 = new Database(tableName2, tableTemplate2);
const table3 = new Database(tableName3, tableTemplate3);
const addResult_1 = table2.add(tableTemplate2);
console.log('add:', addResult_1);

const addResult4 = table1.add({
    "index": 2,
    "name": '',
    "age": 0,
    "sex": ''
});
console.log('add:', addResult4);
const _add5 = table3.add([tableTemplate3, {
    "index": 3,
    "name": '',
    "age": 999,
    "sex": ''
}]);
console.log('add:', _add5);
