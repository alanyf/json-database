const fs = require('fs');
const path = require('path');

// 表类
function Table(param){

    // 公有属性
    this.name = param.name;
    this.path = param.path;
    this.data = param.data||[];
    this.template = deepClone(param.template);

    const prototype = this.constructor.prototype;
    const that = this;
    // 公有方法
    this.addOne = addOne;
    this.add = add;
    this.del = del;
    this.update = update;
    this.search = search;

    saveTableSync();// 实例化时自动保存

    // 私有方法，纯函数，作为工具使用
    //深拷贝
    function deepClone(initalObj) {
        return JSON.parse(JSON.stringify(initalObj)); 
    }
    //查看数据类型
    function typeOf(param){
        var typeStr = Object.prototype.toString.call(param);
        var _tmp = typeStr.split(' ').pop();
        var type = _tmp.slice(0, _tmp.length - 1).toLocaleLowerCase();
        return type;
    }
    function saveTableSync(){
        const tableObj = {
            name: that.name,
            path: that.path,
            data: that.data,
            template: that.template
        }
        const str = JSON.stringify(tableObj);
        fs.writeFileSync(that.path, str);
        return true;
    }
    //读取json文件中的table
    function refreshTableSync(){
        if(fs.existsSync(that.path)){
            const tableStr = fs.readFileSync(that.path);
            const tableObj = JSON.parse(tableStr);
            if(tableObj){
                that.data = tableObj.data;
            }
            return tableObj;
        }
        return null;
    }

    // 公有方法
    //数据库增加一条记录操作
    function addOne(param){
        if(typeOf(param) !== 'object'){
            throw new Error('the param of the function addOne() must be a Object!');
        }
        if(typeof param._id !== 'undefined'){
            throw new Error('_id can\'t be the property of the param of function add()!');
        }
        refreshTableSync();
        this.template._id = this.data.length;
        var obj = deepClone(this.template);
        for(var o in obj){
            if(typeof param[o] !== 'undefined'){
                obj[o] = param[o];
            }
        }
        this.data.push(obj);
        saveTableSync();
        return deepClone(obj);
    }
    //数据库增加操作
    function add(param){
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
    function del(param){
        refreshTableSync();
        const array = this.data;
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
        saveTableSync();
        return result;
    }
    //数据库修改操作
    function update(param, change){
        refreshTableSync();
        const array = this.data;
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
        saveTableSync();
        return result;
    }
    //数据库查询操作
    function search(param){
        refreshTableSync();
        const array = this.data;
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

function Database(){
    // 私有属性
    const LOCAL_PATH = __dirname;
    const DATA_PATH = LOCAL_PATH + '/.data';
    const TABLES_PATH = DATA_PATH + '/tables.json';
    let dbConnectedFlag = false;
    const that = this;

    // 公有属性
    this.tables = {};
    this.table = {};

    // 公有方法
    this.connectDatabase = connectDatabase;
    this.addTable = addTable;
    this.getTable = getTable;

    // 实例化时默认链接上数据库
    this.connectDatabase();

    // 私有方法
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
            const tableStr = fs.readFileSync(_path);
            return JSON.parse(tableStr);
        }
        return null;
    }

    // 公有方法
    //新建表
    function addTable(tableName, template){
        if(typeof tableName !== 'string'|| tableName.length===0){
            throw new Error('The table name is not legal, table name must be a string!');
        }
        if(that.tables[tableName]){
            return that.getTable(tableName);
            //throw new Error('Add table fialed, the table name is already exist!');
        }
        const template_clone = deepClone(template);
        template_clone._id = 0;
        const tablePath = DATA_PATH + '/' + tableName + '.json';
        const tableInfObj = {
            _id: Object.keys(that.tables).length||0,
            name: tableName,
            path: tablePath,
            createTime: Date.now()
        };
        that.tables[tableName] = tableInfObj;
        const tableObj = {
            name: tableName,
            path: tablePath,
            data: [],
            template: template_clone
        }
        const tableInstance = new Table(tableObj);
        saveTableSync(TABLES_PATH, that.tables);

        return tableInstance;
    }
    // 获取已有表
    function getTable(tableName){
        const tableInf = that.tables[tableName];
        if(tableInf){
            const tableObj = readTableSync(tableInf.path);
            const tableInstance = new Table(tableObj);
        
            return tableInstance;
        }
        return null;
    }
    //打开数据库
    function connectDatabase(){
        if(dbConnectedFlag === true){
            return;
        }
        createDataFolder();// 如果存放数据的文件夹不存在就创建一个
        const tablesObj = readTableSync(TABLES_PATH);
        if(tablesObj){
            that.tables = tablesObj;
        }
        dbConnectedFlag = true;
    }
 
}
module.exports = Database;