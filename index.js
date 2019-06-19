const fs = require('fs');
const path = require('path');

function Database(tableName, template){
    const LOCAL_PATH = __dirname;
    const DATA_PATH = LOCAL_PATH + '/.data';
    const TABLE_PATH = DATA_PATH + '/' + tableName + '.json';
    const TABLES_PATH = DATA_PATH + '/tables.json';
    let tableConnectedFlag = false;
    const that = this;
    this.tables = {};
    this.table = {};
    this.name = tableName;
    //const prototype = this.constructor.prototype;
    //查看数据类型
    function typeOf(param){
        var typeStr = Object.prototype.toString.call(param);
		var _tmp = typeStr.split(' ').pop();
		var type = _tmp.slice(0, _tmp.length - 1).toLocaleLowerCase();
		return type;
    }
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
    function createTable(tableName, template){
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
        if(tableConnectedFlag === true){
            return;
        }
        createDataFolder();// 如果存放数据的文件夹不存在就创建一个
        const tableStr = readTableSync(TABLE_PATH);
        const tablesStr = readTableSync(TABLES_PATH);
        if(tablesStr.length !== 0){
            that.tables = JSON.parse(tablesStr);
        }
        if(tableStr.length !== 0){
            that.table = JSON.parse(tableStr);
        }else{
            createTable(tableName, template);
        }
        tableConnectedFlag = true;
    }
    startDatabase(this);
    //数据库增加一条记录操作
    this.addOne = function (param){
        if(typeOf(param) !== 'object'){
            throw new Error('the param of the function addOne() must be a Object!');
        }
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
    //数据库增加操作
    this.add = function (param){
        if(typeOf(param) === 'object'){
            return this.addOne(param);
        }else if(typeOf(param) === 'array'){
            let result = [];
            for(let i=0;i<param.length;i++){
                let e = param[i];
                const addResult = this.addOne(e);
                result.push(addResult);
                if(i >= param.length-1){
                    return result;
                }
            }
        }else{
            throw new Error('the param of the function add() must be a Object or Array!');
        }
    }
    //数据库删除操作
    this.del = function (param){
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
    this.update = function (param, change){
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
    this.search = function (param){
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