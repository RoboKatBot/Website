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
		const div = document.querySelector('.offline div');
		div.addEventListener('click',e=>{
			document.body.style.setProperty('--offline-top',CSS.px(0));
		})
	}
	
	
	//Service Worker

	navigator.serviceWorker.register('/sw.js',{updateViaCache: 'none'}).then(reg=>{
		console.log('Registration of service worker was successful with scope: ',reg.scope);
	}).catch(e=>{
		console.log('Error registering service worker: ',e)
	});

	

	navigator.serviceWorker.addEventListener('message', ({data:{msg}}) => {
		if(msg==="Refresh Required") {
			// location.reload(); //Temporary  
			console.log('Page refreshed');
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
