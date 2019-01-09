////////////////////Website Designed For And Tested With Chrome Version 66+. Not Tested With Other Browsers///////////////////

const config = require('./config.json')
const WebSocket = require('ws');
const router = require('./other/router.js')(); //Custom Router Implementation
const ETagger = new (require('./other/ETagger.js'))('./public/static',/sw\.js$/) //Custom Not Really An ETag System
const Dependents = require('./dependents.json');
const http2 = require('http2');
const fs = require('fs');
const keyPath = require('os').arch() === 'x64' ? 'C:/Users/Lachlan/Documents/Certificate/' : '/etc/letsencrypt/live/lkao.science/';
const pfx = {
	cert: fs.readFileSync(keyPath + 'fullchain.pem'),
	key: fs.readFileSync(keyPath + 'privkey.pem'),
};
const options = {
	...pfx,
	allowHTTP1:true,
	settings:{
		// enableConnectProtocol: true,
		/*enablePush:true*/ //Broken and redundant
	}
};
const server = http2.createSecureServer(options);
server.on('listening',()=>{console.log('Server Started')});
server.on('stream', router);
server.on('error', (err) => console.error(err));
server.on('session',()=>{});
server.on('connection',(socket)=>{
	console.log(`${socket.remoteAddress}:${socket.remotePort} connected`);
});

let generators = {};

fs.promises.readdir('./public/generators').then(fileList=>{
	fileList.forEach(file=>{
		generators['/'+file.slice(0,-3)] = require(`./public/generators/${file}`);
	})
});




////////////////////////Routing////////////////

const router2 = require('./router/NN.js');

router.use(/^\/neural network/i,router2);






router.route(/debug/,'GET',(stream,req)=>{
	if(req.msg) {
		console.log('Error from ',req.referer,': ',Buffer.from(req.msg,"base64").toString());
	}
})



////////////////////////////////////////////////Static File Handler/////////////////////////////////////

router.route(/^(\/(?:.(?!\.\.))+)\.(css|mjs|js|png|wasm|pdf|html|json|mp4|mp3)$|\/$/,'GET',(stream,req,next)=>{
	if (req[':path']==='/') {req[':path']='/home.html'; req.params = ['/home','html'];}

	const cached = ETagger.checkCached(req['cache-digest']);
	var dependents = Dependents[req[':path']] || [];

	var headers = {
		'Content-Type': ({css:'text/css',js:'application/javascript',mjs:'application/javascript',png:'image/png',wasm:'application/wasm',pdf:'application/pdf',html:'text/html',json:'application/json',mp4:'video/mp4'})[req.params[1]],
		'Strict-Transport-Security':'max-age=31536000; includeSubDomains',
		':status':req.params[0]==='/404' ? 404 : 200, 
		...(req['sw']==='true' && {'ETag':ETagger.getETag(req[':path'])})
	}



	if (!cached.includes(req[':path'])) {
		if (req.params[1]==='html'||req.params[1]==='css') stream.priority({weight:50,silent:true}); //prioritise html & css to give faster draw times
		if (req.params[1]==='html'&&req.sw !== 'true'&&req[':path']!=='/index.html') {
			console.log('no service worker, passing at', req[':path'])
			next();
		} else {
			stream.respondWithFile(`./public/static${req[':path']}`,headers,{onError:(err)=>{
				if(err.code==='ENOENT') {
					if(generators[req.params[0]]) {
						stream.respond(headers);
						generators[req.params[0]](0).pipe(stream);
					}
					else {
						console.log(`File: ${req[':path']} requested, and was not found.`);
						router(stream,{...req,':path':'/404.html'});
						dependents = Dependents['/404.html'];
					}
				}
				else {
					console.error('500',err)
				}
			}});
		}
	}
	else {
		headers[':status'] = 304;
		stream.respond(headers);
	}

	if(stream.session.pushAllowed) dependents.forEach(k=>{	//If there are dependents associated with the file, push them
		stream.session.pushStream({':path':`${k}`,'cache-digest':req['cache-digest']},{parent:stream.id},router.push);
	});
});



//////////////////////Transclude html for non service worker html requests////////////////////////////////

router.route(/^(\/(?:.(?!\.\.))+)\.html$/,'GET',(stream,req,next)=>{ //  	/(?:.(?!\.\.))+/ Will not match any url with ../ or ..\\x
	var headers = {
		'Content-Type': 'text/html',
		'Strict-Transport-Security':'max-age=31536000; includeSubDomains',
		':status':req.params[0]==='/404' ? 404 : 200
	}

	console.log('Sending transcluded ', req[':path'])

	stream.respond(headers);

	transclude('./public/static/index.html')
		.then(_=>transclude(`./public/static${req[':path']}`))
		.catch(e=>{
			console.log('transcluding uploaded.html');
			if(generators[req.params[0]]) {
				return transclude(generators[req.params[0]](0));
			}
			console.log(`File: ${req[':path']} requested, and was not found.`);
			router(stream,{...req,':path':'/404.html'});
			return Promise.reject();
		})
		.then(_=>stream.end()).catch(_=>0);
	return;

	function transclude(s) {
		return new Promise((res,rej)=>{
			const RS = s instanceof stream ? s : fs.createReadStream(s);
			RS.pipe(stream,{end:false})
			RS.on('end',res);
		});
	}
});
 


//////////////////////////////////////////////////////////////////////////////////////////////////

const wsServer = new WebSocket.Server({ noServer: true });
server.on('upgrade',(incomingMessage,socket,head)=>{
	wsServer.handleUpgrade(incomingMessage,socket,head,ws=>{
		ws.on('message',(msg)=>{
			console.log('chatroom message: ',msg);
			for (sock of wsServer.clients) {
				if (sock != ws) {
					sock.send(msg);
				}
			}
		});
	});
});


router.route(/^\/upload\/$/,'POST',(stream,req)=>{
	console.log(`file: ${req.filename} uploaded`);
	fw = fs.createWriteStream(`./public/static/uploaded/${req['filename']}`);
	stream.pipe(fw);
});



router.route(/.*/,'all',(stream,req)=>{
	console.log(`File: ${req[':path']} requested, and was not found.`);
	if (stream.state) {
		try {
			stream.respond({':status':404,'Content-Type':'text/plain'});
			stream.end('404 Page Not Found');
		}
		catch (e) {
			console.error(e);
		}
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

require('http').createServer(redirect).listen(8080);

//Http 2 doesn't work on port 443 for some reason? Probably my modem
//Redirect it to port 8000

require('https').createServer(pfx,redirect).listen(8443);

// process.on('unhandledRejection',()=>{
// 	console.log('Promise Unhandled Rejection:', arguments);
// })
