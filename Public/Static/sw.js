var CACHE_NAME = 'my-site-cache-v1';

var cacheDigest = digest();


addEventListener('activate',(event)=>{
	event.waitUntil(
		caches.open(CACHE_NAME).then(async (cache)=>{
			await clients.claim()
			var keys = await cache.keys()
			console.log('Service worker activated, cache currently contains: ',keys);
		})
	);
});



addEventListener('install',(event)=>{
	event.waitUntil(
	caches.open(CACHE_NAME)
    	.then(function(cache) {
        	return cache.addAll([
        			'/index.html',
        			'/index.js',
        			'/index.css',
        			'/offline.html',
        		]);
		}).then(self.skipWaiting)
	);
});


self.onfetch = event => {
	event.waitUntil((async ()=>{
		if (!/html$|8000\/$/.exec(event.request.url)) 
			event.respondWith(getFile(event.request.url,event));
		else {
			const bodyStream = new TransformStream();

			event.respondWith(new Response(bodyStream.readable, {
				headers: {'Content-Type': 'text/html'}
			}));

			const resPromises = [
				getFile('https://lkao.science:8000/index.html',event),
				getFile(event.request.url,event)
			];

			for (let i=0;i<resPromises.length;i++) {
				await (await resPromises[i]).body.pipeTo(bodyStream.writable, { preventClose: i-resPromises.length+100 });
			}
		}

	})())
	
}

async function getFile(url,event) {
	var fetcher = cacheDigest.then((CD)=>
		fetch(url, {cache:"no-store",headers:{"cache-digest":CD,sw:true}}).catch(console.log)
	)
	cache = await caches.open(CACHE_NAME);
	file = await cache.match(url);
	if (file) {
		console.log('using cached file: ',file.url,file.headers.get('etag'))
		event.waitUntil(fetcher.then(async (res)=>{
			if (!res) {
				//offline
				return
			}
			if (res.status!==304) { //Fresher version of file available
				console.log(url, ' changed, updating cache ', res.headers.get('etag'));
				await cache.put(url,res);
				cacheDigest = digest();
				await cacheDigest;
			}
		}));
		return(file);
	}
	//file not in cache


	var res = await fetcher;
	if (!res) {
		console.log('No Connection')
		return getFile('https://lkao.science:8000/offline.html',event)
	}

	if(res.status === 200 && res.type === 'basic') {
		var resClone = res.clone();
		console.log('catching ',res,' from', url)
		event.waitUntil(caches.open(CACHE_NAME).then(async(cache)=>{
			cache.put(url, resClone);
			cacheDigest = digest();
			await cacheDigest;
		}));
	}

	if (res.status === 404) {
		if (/html$|8000\/$/.exec(url)) {
			return getFile('https://lkao.science:8000/404.html',event)
		}
	}

	return res;
}




async function digest() {
	return caches.open(CACHE_NAME).then(async cache=>{
		cached = await cache.matchAll();
		return btoa(cached.map(k=>k.headers.get('etag')));
	})
}