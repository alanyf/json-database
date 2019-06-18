const fs = require('fs');
const path = require('path');

function Database(table, template){
    const LOCAL_PATH = __dirname;
    const DATA_PATH = LOCAL_PATH + '/.data';
    const TABLE_PATH = DATA_PATH + '/' + table + '.json';
    const TABLES_PATH = DATA_PATH + '/tables.json';
    let startFlag = false;
    this.tables = {};
    this.table = {};
    const that = this;
    const prototype = this.constructor.prototype;
    //深拷贝
    function deepClone(initalObj) {
        return JSON.parse(JSON.stringify(initalObj)); 
    }
    function createDataFolder(){
        if(!fs.existsSync(DATA_PATH)){
            fs.mkdirSync(DATA_PATH, { mode: 0777 })
        }
    }
    //保存table到json文件
    function saveTableSync(_path, _tableObj){
        const str = JSON.stringify(_tableObj);
        fs.writeFileSync(_path, str);
        return _path + " table save successfully!";
    }
    //读取json文件中的table
    function readTableSync(_path){
        if(fs.existsSync(_path)){
            const jsonStr = fs.readFileSync(_path);
            return jsonStr;
        }
        return '';
    }
    //新建表
    function addTable(tableName, template){
        if(typeof tableName !== 'string'|| tableName.length===0){
            throw new Error('The table name is not legal, table name must be a string!');
        }
        if(that.tables[tableName]){
            throw new Error('Add table fialed, the table name is already exist!');
        }
        const template_clone = deepClone(template);
        template_clone._id = 0;
        that.table = { "data": [], "template": template_clone};
        const tableInfObj = {
            _id: Object.keys(that.tables).length||0,
            tableName: tableName,
            createTime: Date.now()
        };
        that.tables[tableName] = tableInfObj;
        saveTableSync(TABLE_PATH, that.table);
        saveTableSync(TABLES_PATH, that.tables);
        return true;
    }
    //打开数据库
    function startDatabase(){
        if(startFlag === true){
            return;
        }
        createDataFolder();// 如果存放数据的文件夹不存在就创建一个
        const tableStr = readTableSync(TABLE_PATH);
        const tablesStr = readTableSync(TABLES_PATH);
        if(tablesStr.length !== 0){
            that.tables = JSON.parse(tablesStr);
        }
        if(tableStr.length !== 0){
            table = JSON.parse(tableStr);
            that.table = table;
        }else{
            addTable(table, template);
        }
        startFlag = true;
    }
    startDatabase();
    //数据库增加操作
    prototype.add = function (param){
        if(typeof param._id !== 'undefined'){
            throw new Error('_id can\'t be the property of the param of function add()!');
        }
        this.table.template._id = this.table.data.length;
        var obj = deepClone(this.table.template);
        for(var o in obj){
            if(typeof param[o] !== 'undefined'){
                obj[o] = param[o];
            }
        }
        this.table.data.push(obj);
        saveTableSync(TABLE_PATH, this.table);
        return deepClone(obj);
    }
    //数据库删除操作
    prototype.del = function (param){
        const array = that.table.data;
        const result = [];
        array.forEach((o, i)=>{
            let sameFlag = true;
            for(let p in param){
                if(param[p] != o[p]){
                    sameFlag = false;
                    break;
                }
            }
            if(sameFlag){
                result.push(deepClone(o));
                array.splice(i, 1);
            }
        });
        saveTableSync(TABLE_PATH, this.table);
        return result;
    }
    //数据库修改操作
    prototype.update = function (param, change){
        const array = this.table.data;
        const result = [];
        array.forEach((o, i)=>{
            let sameFlag = true;
            for(let p in param){
                if(param[p] !== o[p]){
                    sameFlag = false;
                    break;
                }
            }
            if(sameFlag){
                for(let p in change){
                    if(typeof o[p] !== 'undefined' && p !== "_id"){
                        o[p] = change[p];
                    }
                }
                result.push(deepClone(o));
            }
        });
        saveTableSync(TABLE_PATH, this.table);
        return result;
    }
    //数据库查询操作
    prototype.search = function (param){
        const array = this.table.data;
        const result = [];
        if(Object.getOwnPropertyNames(param).length === 0){
            return deepClone(array);
        }
        array.forEach(function(o, i){
            let sameFlag = true;
            for(let p in param){
                if(param[p] != o[p]){
                    sameFlag = false;
                    break;
                }
            }
            if(sameFlag){
                result.push(deepClone(o));
            }
        });
        return result;
    }
}

module.exports = Database;
