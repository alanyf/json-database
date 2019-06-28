let fs = require('fs');
const path = require('path');
const util = require('util');
// 让fs支持promise和async
function Fs(){
    const prototype = this.constructor.prototype;
    const isFun = function(e){
		return Object.prototype.toString.call(e) === '[object Function]';
	}
	const isSync = function (s){
		return s.indexOf('Sync') !== -1 || s.indexOf('sync') !== -1 ;
	}
	for(let p in fs){
		const prop = fs[p];
		if(isFun(prop)){
			if(!isSync(prop.name)){
				prototype[p] = util.promisify(prop);
			}else{
				prototype[p] = prop;
			}
		}
	}
}
fs = new Fs();
// 表类
function Table(param){
    instanceParamCheck(param);// 实例化入参检查
    const timeNow = Date.now(); // 现在的时间
    const tableName = param.name; // 表名称
    const dataPath = param.dataPath; // 数据库数据存放的文件夹
    const datas = param.datas || [[]]; // 数据库数据，和多个文件存放的数据一一对应
    const template = deepClone(param.template); // 表模版
    const tableInfPath = dataPath + '/' + tableName + '/' + tableName + '__inf.json'; // 存放表信息的文件地址
    const datasUpdateTime = param.datas.map(e=>timeNow); // 每个表文件最后的修改时间
    let MAX_NUM = param.maxNum||100; // 每个文件存储的最大数量
    let updateTime = timeNow; // 最后更改表数据的时间
    let dataLength = param.dataLength||0;
    // 深拷贝
    function deepClone(param){
        return JSON.parse(JSON.stringify(param)); 
    }
    // 判断数据类型
    function typeOf(param){
        var typeStr = Object.prototype.toString.call(param);
        var lastStr = typeStr.split(' ').pop();
        var type = lastStr.slice(0, lastStr.length - 1).toLocaleLowerCase();
        return type;
    }
    // 实例话参数检查
    function instanceParamCheck(param){
        if(typeOf(param) !== 'object'){
            throw new Error('The param must be a Object!');
        }
        if(!(typeOf(param.name) === 'string' && 
            typeOf(param.dataPath) === 'string' &&
            typeOf(param.datas) === 'array' &&
            typeOf(param.template) === 'object') ){
            throw new Error('When new Table(param), the param must be:  {name: string, path: string, data: array, tempalte: object}!');
        }
    }
    // 返回表文件的路径
    function getTableFilePath(changeTableIndex){
        return dataPath + '/' + tableName + '/' + tableName + '_data' + changeTableIndex + '.json';
    }
    function getDataLength(){
        let sum = 0;
        datas.forEach(data=>sum += data.length);
        return sum;
    }
    // 设置单个文件存储数据的最大数量
    function setMaxNum(){
        if(datas.length <= 100){
            return ;
        }
        const allDataNum = MAX_NUM * datas.length;
        if(allDataNum <= 10000){
            MAX_NUM = 100;
        }else if(allDataNum <= 50000){
            MAX_NUM = 200;
        }else if(allDataNum <= 100000){
            MAX_NUM = 300;
        }else if(allDataNum <= 500000){
            MAX_NUM = 600;
        }else if(allDataNum <= 1000000){
            MAX_NUM = 1000;
        }else{
            MAX_NUM = 1500;
        }
    }
    // 保存表到json文件
    async function saveTable(changeTableIndex){
        if(datas[changeTableIndex]){
            const tableFilePath = getTableFilePath(changeTableIndex);
            const tableData = datas[changeTableIndex];
            const str = JSON.stringify(tableData);
            await fs.writeFile(tableFilePath, str);
        }
        // 保存、更新表的信息
        const timeNow = Date.now();
        updateTime = timeNow;
        datasUpdateTime[changeTableIndex] = timeNow;
        const tableInfObj = {
            name: tableName,
            dataLength: dataLength,
            maxNum: MAX_NUM,
            template: template,
            updateTime: updateTime,
            datasUpdateTime: datasUpdateTime
        }
        const infStr = JSON.stringify(tableInfObj);
        await fs.writeFile(tableInfPath, infStr);
    }
    //把json文件中的table数据更新到内存
    async function refreshTable(){
        isExist = await fs.exists(tableInfPath);
        if(isExist){
            const tableInfStr = await fs.readFile(tableInfPath);
            const tableInfObj = JSON.parse(tableInfStr);
            if(!(tableInfObj&&tableInfObj.updateTime <= updateTime)){
                let asyncArr = tableInfObj.datasUpdateTime.map(file=>{
                    return Promise.resolve(async (time, changeTableIndex)=>{
                        if(time <= datasUpdateTime[changeTableIndex]){
                            return null;
                        }
                        const tableFilePath = getTableFilePath(changeTableIndex);
                        isExist = await fs.exists(tableFilePath);
                        if(isExist){
                            const tableFileStr = await fs.readFile(tableFilePath);
                            const tableFileObj = JSON.parse(tableFileStr);
                            if(tableFileObj){
                                const timeNow = Date.now();
                                datas[changeTableIndex] = tableFileObj;
                                datasUpdateTime[changeTableIndex] = timeNow;
                                updateTime = timeNow;
                            }
                            return tableFileObj;
                        }
                    });
                });
                await Promise.all(asyncArr);
            }
        }
        dataLength = getDataLength();
    }
    // 添加一条数据
    async function addOne(param){
        if(typeOf(param) !== 'object'){
            throw new Error('the param of the function addOne() must be a Object!');
        }
        if(typeof param._id !== 'undefined'){
            throw new Error('_id can\'t be the property of the param of function add()!');
        }
        await refreshTable();
        const obj = deepClone(template);
        obj._id = (datas.length - 1) * MAX_NUM + datas[datas.length - 1].length;// 计算现在共有多少个数据，作为_id
        for(let o in obj){
            if(typeof param[o] !== 'undefined'){
                obj[o] = param[o];
            }
        }
        let changeTableIndex = datas.length;
        for(let i = 0;i<datas.length;i++){
            if(datas[i].length < MAX_NUM){
                datas[i].push(obj);
                changeTableIndex = i;
                break;
            }
        }
        if(changeTableIndex === datas.length){
            datas.push([obj]);// 如果现有的data数组都满了，新加一个数组
        }
        await saveTable(changeTableIndex);
        return deepClone(obj);
    }
    // 添加一条或多条数据
    this.add = async function(param){
        let result = undefined;
        if(typeOf(param) === 'object'){
            setMaxNum();
            result = await addOne(param);
        }else if(typeOf(param) === 'array'){
            setMaxNum();
            result = [];
            for(let i=0;i<param.length;i++){
                result.push(await addOne(param[i]));
            }
        }else{
            throw new Error('the param of the function add() must be a Object or Array!');
        }
        return result;
    }
    // 删除
    this.del = async function(param){
        await refreshTable();
        const array = datas;
        const result = [];
        const changeTableIndexObj = {};
        array.forEach((_arr, index)=>{
            for(let i=0;i<_arr.length;i++){
                const o = _arr[i];
                let sameFlag = true;
                for(let p in param){
                    if(param[p] != o[p]){
                        sameFlag = false;
                        break;
                    }
                }
                if(sameFlag){
                    result.push(deepClone(o));
                    _arr.splice(i, 1);
                    i--;
                    changeTableIndexObj[index] = true;
                }
            }
        });
        const changeTableIndexArr = Object.keys(changeTableIndexObj).map(s=>Number(s));
        let asyncArr = changeTableIndexArr.map(i=>saveTable(i));
        await Promise.all(asyncArr);
        return result;
    }
    // 修改
    this.update = async function(param, change){
        await refreshTable();
        const array = datas;
        const result = [];
        const changeTableIndexObj = {};
        array.forEach((_arr, index)=>{
            _arr.forEach((o, i)=>{
                let sameFlag = true;
                for(let p in param){
                    if(param[p] != o[p]){
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
                    changeTableIndexObj[index] = true;
                }
            });
        });
        const changeTableIndexArr = Object.keys(changeTableIndexObj).map(s=>Number(s));
        let asyncArr = changeTableIndexArr.map(i=>saveTable(i));
        await Promise.all(asyncArr);
        return result;
    }
    // 搜索
    this.search = async function(param){
        await refreshTable();
        let array = [];// datas扁平化后的数组
        datas.forEach(_arr=>array = array.concat(_arr));
        const result = [];
        const that = this;
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
// 数据库类
function Database(){
    // 公有属性
    const DATA_PATH = __dirname + '/.data';
    const TABLES_PATH = DATA_PATH + '/tables.json';
    let DB_CONNECTED_FLAG = false;
    let tables = {};
    let isExist = false;
    // await delFolder(DATA_PATH);
    // await connectDatabase();// 实例化时默认链接上数据库
    function deepClone(param){
        return JSON.parse(JSON.stringify(param)); 
    }
    // 保存表到json文件
    async function saveTable(_path, _tableObj){
        const str = JSON.stringify(_tableObj);
        await fs.writeFile(_path, str);
        return true;
    }
    // 创建目录
    async function createFolder(_dataPath){
        isExist = await fs.exists(_dataPath);
        if(!isExist){
            await fs.mkdir(_dataPath, { mode: '0777' })
        }
        return true;
    }
    // 读取json文件到内存
    async function readTable(_path){
        isExist = await fs.exists(_path);
        if(isExist){
            const tableStr = await fs.readFile(_path);
            return JSON.parse(tableStr);
        }
        return null;
    }
    // 删除文件夹
    async function delFromDisk(_path){
        isExist = await fs.exists(_path);
        if(isExist){  
            const _result = await fs.stat(_path);
            if(_result.isDirectory()){
                const files = await fs.readdir(_path);
                let res = files.map(file=>delFromDisk(_path+'/'+file));
                await Promise.all(res);
                await fs.rmdir(_path);
            }else{
                await fs.unlink(_path);
            }
        }
    }
    // 读取json文件中的tables
    async function refreshTables(){
        isExist = await fs.exists(TABLES_PATH);
        if(isExist){
            const tablesStr = await fs.readFile(TABLES_PATH);
            const tablesObj = JSON.parse(tablesStr);
            if(tablesObj){
                tables = tablesObj;
            }
            return tablesObj;
        }
        return null;
    }
    // 连接数据库
    async function connectDatabase(){
        if(DB_CONNECTED_FLAG === true){
            return;
        }
        await createFolder(DATA_PATH);// 如果存放数据的文件夹不存在就创建一个
        await refreshTables();
        const tablesObj = await readTable(TABLES_PATH);
        if(tablesObj){
            tables = tablesObj;
        }
        DB_CONNECTED_FLAG = true;
    }
    // 添加新表
    this.addTable = async function(tableName, template){
        if(typeof tableName !== 'string'|| tableName.length===0){
            throw new Error('The table name is not legal, table name must be a string!');
        }
        // await delFromDisk(DATA_PATH);
        await connectDatabase();// 实例化时默认链接上数据库
        await refreshTables(this);
        
        const tablePath = DATA_PATH + '/' + tableName;
        isExist = await fs.exists(tablePath);
        if(tables[tableName] && isExist){
            let isSame = true;
            for(let p in template){
                if(template[p] !== tables[tableName].tempalte[p]){
                    isSame = false;
                }
            }
            if(!isSame){
                  throw new Error('Table '+tableName+' is already exist or the template is changed!');
            }
            return await this.getTable(tableName);
        }else{
            await createFolder(tablePath);
        }
        const template_clone = deepClone(template);
        const tableInfObj = {
            _id: Object.keys(tables).length||0,
            name: tableName,
            path: tablePath,
            tempalte: template_clone,
            createTime: Date.now()
        };
        tables[tableName] = tableInfObj;
        await saveTable(TABLES_PATH, tables);
        template_clone._id = 0;
        const tableObj = {
            name: tableName,
            dataPath: DATA_PATH,
            datas: [[]],
            template: template_clone
        }
        const tableInstance = new Table(tableObj);

        return tableInstance;
    }
    // 表已存在，从json文件读取表
    this.getTable = async function(tableName){
        //await delFolder(DATA_PATH);
        await connectDatabase();// 实例化时默认链接上数据库
        await refreshTables(this);
        const tableInf = tables[tableName];
        if(tableInf){
            const tablePath = DATA_PATH + '/' + tableName;
            const tableInfPath = tablePath + '/' + tableName + '__inf.json';
            isExist = await fs.exists(tableInfPath);
            if(isExist){
                const tableInfStr = await fs.readFile(tableInfPath);
                const tableInfObj = JSON.parse(tableInfStr);
                
                const asyncArr = tableInfObj.datasUpdateTime.map(async (e, tableFileIndex)=>{
                        const tableFilePath = tablePath + '/' + tableName + '_data' + tableFileIndex + '.json';;
                        let isExist = await fs.exists(tableFilePath)
                        if(isExist){
                            const tableFileStr = await fs.readFile(tableFilePath);
                            const tableFileObj = JSON.parse(tableFileStr);
                            return tableFileObj
                        }
                        return null;
                });
                const tableDatas = await Promise.all(asyncArr);
                const template_clone = deepClone(tableInfObj.template);
                const tableObj = {
                    name: tableInfObj.name,
                    dataPath: DATA_PATH,
                    datas: tableDatas,
                    template: template_clone,
                    maxNum: tableInfObj.maxNum,
                    dataLength: tableInfObj.dataLength
                };
                const tableInstance = new Table(tableObj);
                return tableInstance;
            }
        }
        return null;
    }
}
module.exports = Database;