router = {}

router.use = function(route,router) {
	router.baseRouter = this;
	this.routes.set([route,['GET','POST','HEAD','PUT','DELETE','OPTIONS','CONNECT','TRACE','PATCH','WSS']],router);
}

router.handle = function(stream,req,iter) {
	var iter = iter && typeof iter.next==='function'?iter:this.routes.entries();
	while ([value,done]=Object.values(iter.next()),!done) {
		[[route,Methods],handler] = value;
		if ((Methods.includes(req[':method'])||Methods==='all') && (regex = route.exec(req[':path']),regex)) {
			[,...req.params] = regex;
			handler(stream,req,this.handle.bind(this,stream,req,iter));
			return;
		}
	}
}

router.route = function(route,methods,handler) {
	this.routes.set([route,methods],handler)
}


function routerFact() {
	function app(stream,req) {
		req[':path'] = decodeURI(req[':path']).toLowerCase();	
		// console.log(req[':path'],req[':method'])
		return app.handle(stream,req)
	}
	Object.assign(app,router);
	app.routes = new Map();
	return app;
}

exports = module.exports = routerFact;

exports.route = router.route.bind(router);
