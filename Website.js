////////////////////Website Designed For And Tested With Chrome Version 66+. Not Tested With Other Browsers///////////////////

const config = require('./config.json')
const WebSocket = require('ws');
const router = require('./other/router.js')(); //Custom Router Implementation
const ETagger = new (require('./other/ETagger.js'))('./public/static',/sw\.js$/) //Custom Not Really An ETag System
const Dependents = require('./Dependents.json');
const http2 = require('http2');
const fs = require('fs');
const pfx = require('fs').readFileSync(config.certificate);
const options = {
	pfx,
	allowHTTP1:true,
	settings:{
		enablePush:true
	}
};
const server = http2.createSecureServer(options);
server.on('listening',()=>{console.log('Server Started')});
server.on('stream', router);
server.on('error', (err) => console.error(err));
const wss = new WebSocket.Server({ server });

wss.on('connection',(ws,req)=>{
	req = {':path':req[':path'],':method':'WSS'};
	router(ws,req);
});

// const router2 = require('./router/NN.js');

// router.use(/^\/Neural Network\//,router2);




//////////////////////Transclude html for non service worker requests, pass if using service worker/////////////////////////////////

router.route(/^(\/(?:.(?!\.\.))+)\.html$|\/$/,'GET',(stream,req,next)=>{ //  	/(?:.(?!\.\.))+/ Will not match any url with ../ or ..\\x
	if (req[':path']==='/') {req[':path']='/home.html'}

	if (req.sw === 'true'||req[':path']==='/index.html') {
		return next(); //If client is using service worker then there is no need to transclude the document server side -> serve as static resource
	}

	try {
		fs.statSync(`./public/static${req[':path']}`)
	}
	catch (e) {
		router(stream,{...req,':path':'/404.html'})
		return console.log(`File: ${req[':path']} requested, and was not found.`)
	}


	const dependents = (Dependents[req[':path']] ||[]).filter(k=>k!=='/index.html').concat(Dependents['/index.html']); //If no service worker is being used, resources will be pushed every time

	var headers = {
		'content-type':'text/html',
		'Strict-Transport-Security':'max-age=31536000; includeSubDomains'
	}
	
	stream.respond(headers);
	transclude('./public/static/index.html').then(_=>transclude(`./public/static${req[':path']}`)).then(()=>stream.end());

	if(stream.session.pushAllowed) dependents.forEach(k=>{	//If there are dependents associated with html file, push them
		stream.session.pushStream({':path':`${k}`},{parent:stream.id},router.push);
	});
	return;

	function transclude(file) {
		return new Promise((res,rej)=>{
			const RS = fs.createReadStream(file);
			RS.pipe(stream,{end:false})
			RS.on('end',res);
		});
	}
});


////////////////////////////////////////////////Static File Handler/////////////////////////////////////

router.route(/^(\/(?:.(?!\.\.))+)\.(css|js|png|wasm|pdf|html|json)$/,'GET',(stream,req)=>{
	const cached = ETagger.checkCached(req['cache-digest']);
	const dependents = Dependents[req[':path']] || [];
	// const uncached = dependents.filter(k=>!cached.includes(k))

	var headers = {
		'Content-Type': ({css:'text/css',js:'application/javascript',png:'image/png',wasm:'application/wasm',pdf:'application/pdf',html:'text/html',json:'application/json'})[req.params[1]],
		'Strict-Transport-Security':'max-age=31536000; includeSubDomains',
		'ETag':ETagger.getETag(req[':path'])
	}

	if (!cached.includes(req[':path'])) {
		if (req.params[2]==='css') stream.priority({weight:50,silent:true}) //prioritise css to give faster draw times
		stream.respondWithFile(`./public/static${req[':path']}`,headers,{onError:(err)=>{
			if(err.code==='ENOENT') {
				stream.respond({':status':404});
				stream.end();
				if(stream.session.pushAllowed) stream.session.pushStream({':path':'/404.html'},{parent:stream.id},router.push);
				console.log(`File: ${req[':path']} requested, and was not found.`)
			}
			else {
				console.error('500',err)
			}
		}});
	}
	else {
		stream.respond({...headers,':status':304});
	}
	if(stream.session.pushAllowed) dependents.forEach(k=>{	//If there are dependents associated with the file, push them
		stream.session.pushStream({':path':`${k}`,'cache-digest':req['cache-digest']},{parent:stream.id},router.push);
	});
});

//////////////////////////////////////////////////////////////////////////////////////////////////

chatSockets = [];

router.route(/^\/Chatroom\/wss$/,'WSS',(ws,req)=>{
	chatSockets.push(ws);
	ws.on('close',()=>{
		chatSockets.splice(chatSockets.indexOf(ws),1);
	});
	ws.on('message',(msg)=>{
		for (sock of chatSockets) {
			if (sock != ws) {
				sock.send(msg);
			}
		}
	});
})


router.route(/.*/,'all',(stream,req)=>{
	console.log(`File: ${req[':path']} requested, and was not found.`);
	if (stream.state) {
		stream.respond({':status':404,'Content-Type':'text/plain'})
		stream.end('404 Page Not Found')
	}
});

// QueryData = JSON.parse(`{${data.toString().replace(/(\w+)=(\w+)(&?)/g,(_,p1,p2,p3)=>`"${p1}":"${p2}"${p3&&','}`)}}`); 
// Query string parser

server.listen(8000);


//Redirect http traffic to https
function redirect(req,res) {
	res.writeHead(302, {'Location': 'https://' + req.headers.host + ':8000' + req[':path']});
	res.end();
}

require('http').createServer(redirect).listen(80);

//Http 2 doesn't work on port 443 for some reason? Probably my modem
//Redirect it to port 8000

require('https').createServer({pfx},redirect).listen(443);


process.on('unhandledRejection',()=>{
	console.log('Promise Unhandled Rejection:', arguments);
})