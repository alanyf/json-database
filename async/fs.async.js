const fs = require('fs');
const util = require('util');

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
			if(!isSync(prop)){
				prototype[p] = util.promisify(prop);
			}else{
				prototype[p] = prop;
			}
		}
	}
}
module.exports = new Fs();