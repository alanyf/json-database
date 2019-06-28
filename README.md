# json-database

## 项目介绍
基于nodejs，通过操作json文件实现的迷你数据库  


## 使用举例 
可直接查看或运行demo.js
```
git clone http://****
```

```
cd json-database
```

```
node demo.js
```

## api接口使用介绍

### 一、引入index.js文件，创建数据库实例
```
const Database = require('./index.js');
const DB = new Database();
```
### 二、定义表名称、模版，创建表

1. 定义表名和模版  

    ```
    // 定义表名和模版
    const tableName = 'cat';
    const tableTemplate = {
        "index": 0,
        "name": '',
        "age": 0,
        "sex": ''
    }
    ```
2. 创建表  

    创建表并向其中添加一条数据。
    ```
    const table = await DB.addTable(tableName, tableTemplate);
    const record = {
        "index": 0,
        "name": 'tom',
        "age": 8,
        "sex": 'male'
    };
    // 向表中添加一条数据
    const res = await table.add(record);

    ```
    **```注意```**：需要在 ```async``` 函数中才可以使用 ```await``` 语句。  

    也可以使用promise操作。
    ```
    // 创建表
    DB.addTable(tableName, tableTemplate).then((table)=>{
        const record = {
            "index": 0,
            "name": 'tom',
            "age": 8,
            "sex": 'male'
        };
        // 向表中添加一条数据
        table.add(record).then((res)=>{
            console.log(res);
        }).catch(err=>console.log(err));
    }).catch((err)=>{
        console.log(err);
    });
    ```

3. add() 添加数据  

    当传入一个对象时，add()方法默认为添加一条数据，此时返回值为添加到数据库后增加的那条记录的一个对象。
    ```
    const resObj = await table.add(record);
    ```
    当传入一个数组时，add()方法认为同时添加多条数据，返回值为添加到数据库后增加的所有记录的一个数组。
    ```
    const resArr = await table.add([record1, record2, record3]);
    ```

3. del() 删除数据  

    删除操作只接收一个对象作为参数，对象是搜索条件，返回值是所有被删除的记录，如果未匹配到数据，则返回空数组。
    ```
    // 删除所有 index 属性为 0 的记录，返回存有对象的数组
    const resArr = await table.del({index: 0});
    // 删除所有 id 属性为 0 的记录，没找到，返回空数组。
    const resArr = await table.del({id: 0});
    ```

3. update() 修改数据  

    修改操作有两个参数，两个参数都是对象，第一个对象是搜索条件，第二个对象包含了要修改的属性和值。  
    找到满足条件的记录就返回存放所有被修改后记录的数组，找不到则返回空数组。
     ```
    // 找到所有 index 属性为 0 的记录，修改它们的 age 属性值为 9 
    const resArr = await table.update({index: 0}, {age: 9});
    ```

4. search() 查找数据  

    查找操作只接收一个对象作为参数，对象是搜索条件。   
    找到满足条件的记录就返回存放所有满足条件的记录的数组，找不到则返回空数组。    
    注意如果传空对象则返回存放所有数据的数组。
     ```
    // 找到所有 index 属性为 0 的记录，修改它们的 age 属性值为 9 
    const resArr = await table.update({index: 0}, {age: 9});
    ```



