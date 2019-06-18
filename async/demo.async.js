const Database = require('./index.async.js');

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
    "index": 0,
    "name": '',
    "size": 0,
    "price": 0
}
async function run(){
    const table1 = new Database(tableName1, tableTemplate1);
    await table1.startDatabase();
    const addResult1 = await table1.add(tableTemplate1);
    console.log('add:', addResult1);
    //const addResult2 = await table1.add(tableTemplate1);
    //console.log('add:', addResult2);
    const addResult3 = await table1.add({
        "index": 1,
        "name": '',
        "age": 0,
        "sex": ''
    });
    console.log('add:', addResult3);
    const addResult4 = await table1.add({
        "index": 2,
        "name": '',
        "age": 0,
        "sex": ''
    });
    console.log('add:', addResult4);
    const delResult1 = await table1.del({index: 1});
    console.log('del:', delResult1);
    const delResult2 = await table1.update({index: 2}, {age: 18});
    console.log('update:', delResult2);
    const searchResult = await table1.search({index: 0});
    console.log('search:', searchResult);



    // const table2 = new Database(tableName2, tableTemplate2);
    // await table1.startDatabase();
    // const addResult = await table2.add(tableTemplate2);
    // console.log('add:', addResult);


}
run();