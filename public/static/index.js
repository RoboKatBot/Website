"use strict";

/*window.onerror = (e)=>{
	fetch('https://lkao.science:8000/debug',{headers:{msg:btoa(JSON.stringify(e))}})
}

window.onunhandledrejection = (e)=>{
	fetch('https://lkao.science:8000/debug',{headers:{msg:btoa(JSON.stringify(e))}})
}*/


const ready = new Promise((res)=>{
	document.addEventListener('DOMContentLoaded',res);
})


ready.then(_=>{
	function toggleHidden() {
		if(this.classList.contains("-hidden")) {
			this.classList.remove("-hidden");
			this.nextElementSibling.style.height = this.nextElementSibling.scrollHeight+'px';
		}
		else {
			this.classList.add("-hidden");
			this.nextElementSibling.style.height = "0px";
		}
	}

	[...document.querySelectorAll(".nav-menu-dropdown-toggle")].forEach(function(button) {
		button.addEventListener("click",toggleHidden);
	})


	/*[...document.querySelectorAll('.nav-menu-link')].forEach(k=>{
		k.addEventListener('click',(event)=>{
			if(event.getModifierState('Shift')||event.getModifierState('Control')) return;
			event.preventDefualt();
			let super = document.getElementsByClass('super'),
				decoder = new TextDecoder();
			fetch(k.href,{'Transclude-Free':true})
				.then(res=>res.body.getReader())
				.then(reader =>reader.read()
					.then(function process({done,value}) {
						if(done) return reader.closed;
						super.innerhtml += decoder.decode(value);
						return reader.read().then(process);
					})
				);
		});
	});*/
	{
		document.querySelector('.dismiss-banner').addEventListener('click',e=>{
			document.body.style.setProperty('--banner-top',CSS.px(0));
		})
	}
	
	
	//Service Worker

	navigator.serviceWorker.register('/sw.js',{updateViaCache: 'none'}).then(reg=>{
		console.log('Registration of service worker was successful with scope: ',reg.scope);
	}).catch(e=>{
		console.log('Error registering service worker: ',e)
	});

	

	navigator.serviceWorker.addEventListener('message', ({data:{msg}}) => {
		console.log(`Message from service worker: ${msg}`);
		switch(msg) {
			case 'OfflineCached':
				document.body.style.setProperty('--banner-top',CSS.px(35));
				document.querySelector('.banner h3').innerText = 'Unable to connect to server, serving page from cache.';
				break;
			case 'RefreshRequired':
				document.body.style.setProperty('--banner-top',CSS.px(35));
				let div = document.querySelector('.banner h3');
				div.innerText = 'A newer version of this page is avaliable, click here to refresh.';
				div.style.cursor = 'pointer';
				div.addEventListener('click',(e)=>{
					location.reload();
				},{once:true});
				break;
			default:
				console.log('Uknown message',data);
		}
	});



	let defferedEvent;
	onbeforeinstallprompt = function(e) {
		e.preventDefault();
		defferedEvent = e;
		document.querySelector('.A2HS-button').style.display = 'block';
	}
	document.querySelector('.A2HS-button').addEventListener('click',e=>{
		e.preventDefault();
		document.querySelector('.A2HS-button').style.display = 'none';
		defferedEvent.prompt();
	})


},{once:true});//End Of Document Load Event
