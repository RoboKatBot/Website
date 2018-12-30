const chokidar = require('chokidar');
const fs = require('fs');
const crypto = require('crypto');




try {
	var [state,counter] = require('./ETag.json');
} catch (e) {
	var [state,counter] = [{},0];
}




class ETagger {
	constructor(path,ignored) {
		this.ready;
		this.path = path;
		this.files = [];
		this.ignored = ignored;
		// var watcher = chokidar.watch(path,{persistent:false,ignored});
		// watcher.on('add',this.update.bind(this))
		// 	.on('change',this.update.bind(this))
		// 	.on('unlink',file=>{
		// 	file = file.slice(this.path.length-2).toLowerCase().replace(/\\/g,'/')
		// 	console.log(`${file} deleted`);
		// 	delete state[file]
		// 	this.save();
		// });

		// watcher.on('ready',()=>{
		// 	this.ready = true;
		// 	Object.entries(state).filter(k=>!this.files.includes(k[0])).map(k=>{delete state[k[0]]})
		// 	this.save();
		// });
	}

	hashFile(file) {
		return new Promise((res,rej)=>{
			var fr = fs.createReadStream(file);
			var hash = crypto.createHash('sha256');
			fr.on('end',()=>res(hash.digest().toString()));
			fr.pipe(hash);
		})
	}

	update(file) {
		file = file.slice(this.path.length-2).toLowerCase().replace(/\\/g,'/');
		if(this.ready) console.log(`${file} updated`);
		this.files.push(file);
		this.hashFile(`./public/static${file}`).then((hash)=>{
			if(state[file]&&state[file][0]===hash) return;
			state[file] = [hash,counter++];
			this.save();
		})
	}

	save() {
		if(!this.ready) return;
		fs.writeFile(__dirname + '/ETag.json',JSON.stringify([state,counter]),(err)=>err&&console.error(err))
	}

	checkCached(digest) {
		if(!digest) return [];
		var cached = new Buffer.from(digest,'base64').toString().split(',').map(k=>parseInt(k));
		return Object.entries(state).filter(k=>cached.includes(k[1][1])).map(k=>k[0]);
	}

	getETag(file) {
		file = file.toLowerCase().replace(/\\/g,'/');
		if(this.ignored.exec(file)) return;
		if(!state[file]) {
			console.log('No ETag for ',file);
			return;
		}
		return state[file][1];
	}

}




exports = module.exports = ETagger;
