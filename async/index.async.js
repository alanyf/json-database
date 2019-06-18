const fs = require('fs');
const path = require('path');

function Database(tableName, template){
    if(typeof tableName !== 'string'|| tableName.length===0){
        throw new Error('The table name is not legal, table name must be a string!');
    }
    const LOCAL_PATH = __dirname;
    const DATA_PATH = LOCAL_PATH + '/.data';
    const TABLE_PATH = DATA_PATH + '/' + tableName + '.json';
    const TABLES_PATH = DATA_PATH + '/tables.json';
    let startFlag = false;
    this.tables = {};
    this.table = {};
    const that = this;
    const prototype = this.constructor.prototype;
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
    function saveTable(_path, _tableObj){
        const str = JSON.stringify(_tableObj);
        fs.writeFileSync(_path, str);
        return _path + " table save successfully!";
    }
    function delTable(_path){
        if(fs.existsSync(_path) && !fs.statSync(_path).isDirectory()) {
            fs.unlinkSync(_path); // delete file
            that.tables[tableName] = undefined;
            saveTable(TABLES_PATH, that.tables);
            return ;
        }
        throw new Error('Delete table fialed, the table file is exist!');
    }
    //读取json文件中的table
    async function readTable(_path){
        if(fs.existsSync(_path)){
            const jsonStr = fs.readFileSync(_path);
            return jsonStr.toString();
        }
        return '';
    }
    //新建表
    async function addTable(template){
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
        saveTable(TABLE_PATH, that.table);
        saveTable(TABLES_PATH, that.tables);
        return true;
    }
    //打开数据库
    prototype.startDatabase = async function (){
        if(startFlag){
            return;
        }
        createDataFolder();// 如果存放数据的文件夹不存在就创建一个
        const tableStr = await readTable(TABLE_PATH);
        const tablesStr = await readTable(TABLES_PATH);
        if(tablesStr.length !== 0){
            that.tables = JSON.parse(tablesStr);
        }
        if(tableStr.length !== 0){
            table = JSON.parse(tableStr);
            that.table = table;
        }else{
            await addTable(template);
        }
        startFlag = true;
    }
    prototype.addOne = async function (param){
        if(typeOf(param) !== 'object'){
            throw new Error('the param of the function addOne() must be a Object!');
        }
        if(typeof param._id !== 'undefined'){
            throw new Error('_id can\'t be the property of the param of function add()!');
        }
        this.table.template._id = this.table.data.length;
        var obj = deepClone(this.table.template);
        let sameFlag = true;
        for(let o in obj){
            if(typeof param[o] !== 'undefined'){
                sameFlag = false;
                obj[o] = param[o];
            }
        }
        if(sameFlag === false){
            this.table.data.push(obj);
            saveTable(TABLE_PATH, this.table);
            return deepClone(obj);
        }else{
            return {};
        }
    }
    //数据库增加操作
    prototype.add = async function (param){
        if(typeOf(param) === 'object'){
            return await this.addOne(param);
        }else if(typeOf(param) === 'array'){
            let asyncCount = 0;
            let result = [];
            param.forEach(async(e, i)=>{
                const addResult = await this.addOne(e);
                result[i] = addResult;
                asyncCount++;
                if(asyncCount >= param.length){
                    return result;
                }
            });
        }else{
            throw new Error('the param of the function add() must be a Object or Array!');
        }
    }
    //数据库删除操作
    prototype.del = async function (param){
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
        console.log(this.table);
        saveTable(TABLE_PATH, this.table);
        return result;
    }
    //数据库修改操作
    prototype.update = async function (param, change){
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
        saveTable(TABLE_PATH, this.table);
        return result;
    }
    //数据库查询操作
    prototype.search = async function (param){
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
