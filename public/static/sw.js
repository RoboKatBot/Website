/*"use strict";

const CACHE_NAME = 'my-site-cache-v1';
var cacheDigest = digest();


addEventListener('activate',(event)=>{
	event.waitUntil(
		caches.open(CACHE_NAME).then(async (cache)=>{
			// await clients.claim()
			var keys = await cache.keys()
			console.log('Service worker activated, cache currently contains: ',keys);
			await Promise.all(keys.map(req=>{  
				return getFile(req.url,event);
			}));
		}).catch(console.error)
	);
});



addEventListener('install',(event)=>{
	event.waitUntil(
	caches.open(CACHE_NAME)
		.then(cache=>
			Promise.all([
					'/index.html',
					'/index.js',
					'/index.css',
					'/offline.html',
					'/offline.css',
			].map(k=>getFile(location.origin+k,event).catch(console.error)))
		)	.then(_=>self.registration.navigationPreload.enable())
			// .then(_=>self.skipWaiting())
			.catch(console.error)
	);
});

let q;

self.onfetch = event => {
	// if(!event.clientId) return; //Ignore cross origin requests
	event.waitUntil((async ()=>{

		if(/gl.?\.html/i.exec(event.request.url)) {
			q = await event.preloadResponse;
			debugger;
		}


		if(event.request.method!=='GET') return;
		if (!/html$|8000\/$/.exec(event.request.url)||event.request.headers.get('Transclude-Free')) 
			event.respondWith(getFile(event.request.url,event));
		else {
			const bodyStream = new TransformStream();
			
			const resPromises = [
				getFile(location.origin+'/index.html',event),
				getFile(event.request.url,event).catch(e=>{
					if(e==='OfflineNoCached')
						return getFile(location.origin+'/offline.html',event);
				})
			];

			for (let i=0;i<resPromises.length;i++) {
				await (await resPromises[i]).body.pipeTo(bodyStream.writable, { preventClose: i-resPromises.length+1 });
			}

			event.respondWith(new Response(bodyStream.readable, {
				headers: {'Content-Type': 'text/html'}
			}));			
		}
	})())
}

async function getFile(url,event) {
	var fetcher = Promise.resolve(event.preloadResponse).then(r=>0||cacheDigest.then((CD)=>
		fetch(url, {cache:"no-store", credentials:'include',headers:{"service-worker":CD}}).catch(e=>console.error('Failed to fetch ',url))
	));
	const cache = await caches.open(CACHE_NAME);
	const file = await cache.match(url); //preloadResponse body consumed if too long a wait
	if (file) {
		const client = self.clients.get(event.clientId);
		// console.log('using cached file: ',file.url,file.headers.get('etag'))
		event.waitUntil(fetcher.then(async (res)=>{
			if (!res) {
				await client.then(c=>c&&c.postMessage({msg:'OfflineCached'}));
				return;
			}
			if (res.status!==304) { //Fresher version of file available
				console.log(url, ' changed, updating cache ', res.headers.get('etag'));
				await cache.put(url,res);
				cacheDigest = digest();
				await client.then(c=>c&&c.postMessage({msg:'RefreshRequired'}));
				await cacheDigest;
			}
		}));
		return(file);
	}
	//file not in cache


	var res = await fetcher;
	if (!res) {
		throw 'OfflineNoCached';
		return console.log('No Connection') //Can't Retrieve file and no version cached.
	}

	if(res.status === 200 && res.type === 'basic' && res.headers.get('ETAG')) {
		var resClone = res.clone();
		console.log('catching ',res,' from', url)
		event.waitUntil(caches.open(CACHE_NAME).then(async(cache)=>{
			cache.put(url, resClone);
			cacheDigest = digest();
			await cacheDigest;
		}));
	}

	if (res.status === 404) {
		console.log(`404 ${url} not found`)
	}

	return res;
}




async function digest() {
	const digest = caches.open(CACHE_NAME).then(async cache=>{
		return btoa((await cache.matchAll()).map(k=>k.headers.get('etag')));
	})
	digest.then(d=>
		registration.navigationPreload.setHeaderValue(d)
	).catch(console.error);
	return digest;
}*/