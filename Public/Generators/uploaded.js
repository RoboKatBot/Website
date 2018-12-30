"use strict"

const fs = require('fs').promises;
const { PassThrough } = require('stream'); 

const header = Buffer.from(
`		<!-- This is to be transcluded into the .super element-->
		<title>Uploaded</title>`);

const footer = Buffer.from(
`	</div>
</body>
</html>`);


// const content = 
var pageSize = 15;

module.exports = (pageNumber)=>{
	let PT = PassThrough();
	PT.write(header);
	const content = fs.readdir(`./public/static/uploaded`).then(fileArray=>{
		return fileArray.slice(pageSize*pageNumber,pageSize*(pageNumber+1)).map(file=>{
			if(/^(.*)\.(image|png|bmp|jpeg|gif)$/.exec(file)) {
				return `<li><img src="/uploaded/${file}"></li>`
			}
			// if(/^(.*)\.(txt|js|json|py|css|html|log)$/.exec(file)) {
			// 	return `<li><img src="/uploaded/${file}"></li>`
			// }
			return `<li><a href="/uploaded/${file}">${file}</a></li>`
		})
	}).then(c=>c.join('\n')).then(c=>Buffer.from(c)).then(c=>PT.write(c)).then(_=>
		PT.write(footer)
	).then(_=>PT.end());
	return PT;
}