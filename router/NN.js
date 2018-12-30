const Data 			= require("../Neural Network/other/ReadData");
const router 		= require('../other/router.js')();
const Dependents 	= require('../Dependents.json');
router.baseRouter;

router.route(/\/home\.html$/,'GET',(stream,req,next)=>{
	next();
	// (a = Dependents["Neural Network/home.html"]) && a.forEach(k=>{
	// 	stream.pushStream({':path':`/${k}`},router.baseRouter);
	// });
	// stream.end(pug.renderFile('./public/Neural Network/home.pug',{i:(Math.random()*5000)|0}));
});

router.route(/^\/neural network\/data(\?i=(\d+))?$/,'GET',(stream,req)=>{
	Data.getData(req.params[1],(data,label)=>{
		stream.respond({'Content-Type': 'application/octet-stream'});
		stream.end(Buffer.concat([Buffer.from([Data.x,Data.y]),label,data])); 
	});
});


module.exports = router;