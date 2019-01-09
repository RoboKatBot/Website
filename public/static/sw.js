"use strict";

const CACHE_NAME = 'my-site-cache-v1';
var cacheDigest = digest();


addEventListener('activate',(event)=>{
	event.waitUntil(
		caches.open(CACHE_NAME).then(async (cache)=>{
			await clients.claim()
			var keys = await cache.keys()
			console.log('Service worker activated, cache currently contains: ',keys);
			await Promise.all(keys.map(req=>{  
				return getFile(req.url,event);
			}));
		})
	);
});



addEventListener('install',(event)=>{
	event.waitUntil(
	caches.open(CACHE_NAME)
		.then(function(cache) {
			return Promise.all([
					'/index.html',
					'/index.js',
					'/index.css',
					'/offline.html',
			].map(k=>getFile(k,event)));
		}).then(self.skipWaiting)
	);
});


self.onfetch = event => {
	// if(!event.clientId) return; //Ignore cross origin requests
	event.waitUntil((async ()=>{
		if(event.request.method!=='GET') return;
		if (!/html$|8000\/$/.exec(event.request.url)||event.request.headers.get('Transclude-Free')) 
			event.respondWith(getFile(event.request.url,event));
		else {
			const bodyStream = new TransformStream();

			event.respondWith(new Response(bodyStream.readable, {
				headers: {'Content-Type': 'text/html'}
			}));

			const resPromises = [
				getFile(location.origin + '/index.html',event),
				getFile(event.request.url,event).catch(e=>{
					if(e==='OfflineNoCached')
						return getFile(location.origin + '/offline.html');
				})
			];

			for (let i=0;i<resPromises.length;i++) {
				await (await resPromises[i]).body.pipeTo(bodyStream.writable, { preventClose: i-resPromises.length+1 });
			}
		}
	})())
}

async function getFile(url,event) {
	var fetcher = cacheDigest.then((CD)=>
		fetch(url, {cache:"no-store", credentials:'include',headers:{"cache-digest":CD,sw:true}}).catch(e=>console.error('Failed to fetch ',url))
	)
	const cache = await caches.open(CACHE_NAME);
	const file = await cache.match(url);
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
				await client.then(c=>c&&c.postMessage({msg:'Refresh Required'}));
				await cacheDigest = digest();
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
	return caches.open(CACHE_NAME).then(async cache=>{
		return btoa((await cache.matchAll()).map(k=>k.headers.get('etag')));
	})
}