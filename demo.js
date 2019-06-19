const Database = require('./index.js');

// 使用样例
const tableName1 = 'table_name_1';
const tableName2 = 'table_name_2';
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

const addResult4 = table1.add({
    "index": 2,
    "name": '',
    "age": 0,
    "sex": ''
});
console.log('add:', addResult4);

const delResult1 = table1.del({index: 1});
console.log('del:', delResult1);

const delResult2 = table1.update({index: 2}, {age: 18});
console.log('update:', delResult2);

const searchResult = table1.search({index: 0});
console.log('search:', searchResult);



// const table2 = new Database(tableName2, tableTemplate2);
// const addResult_1 = table2.add(tableTemplate2);
// console.log('add:', addResult_1);

// const addResult4 = table1.add({
//     "index": 2,
//     "name": '',
//     "age": 0,
//     "sex": ''
// });
// console.log('add:', addResult4);
// const addResult_2 = table2.add({
//     "id": 1,
//     "time": '0617',
//     "size": 90,
//     "price": 100
// });
// console.log('add:', addResult_2);
