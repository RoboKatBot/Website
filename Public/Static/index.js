HTMLCollection.prototype.forEach = Array.prototype.forEach;


document.addEventListener('DOMContentLoaded',()=>{

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

	document.getElementsByClassName("nav-menu-dropdown-toggle").forEach(function(button) {
		button.addEventListener("click",toggleHidden);
	})

	document.getElementsByClassName('nav-menu-link').forEach((link)=>{
		link.onclick = (event)=>{
			if(event.ctrlKey||event.shiftKey) {return true;}
			var href = link.href;
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function(){
				if(this.readyState==4&&this.status==200) {
					window.history.pushState({},'',href);
					parser=new DOMParser();
					newdocument=parser.parseFromString(this.response, "text/html");

					Array.from(document.head.children).filter(k=>(!k.className||k.className!=='index'))
						.forEach(k=>{k.remove();});
					var i = newdocument.head.children.length-1;
					while ( i >= 0) {
						k = newdocument.head.children[i--];
						if(k.className && k.className=='index') {}
						else if(k.tagName==="SCRIPT") {
							var newScript = document.createElement('script');
							newScript.async=false;
							newScript.setAttribute('src',k.src);
							document.head.prepend(newScript);
						}
						else {
							document.head.prepend(k);
						}
					}

					document.getElementsByClassName('super')[0].innerHTML = newdocument.getElementsByClassName('super')[0].innerHTML;
					document.dispatchEvent(new Event('SoftLoad'));
					delete parser;
				}
			};
			xhttp.open('GET',href);
			xhttp.send();
			event.preventDefault();
		};
	});



	//Service Worker

	navigator.serviceWorker.register('/sw.js').then(reg=>{
		console.log('Registration of service worker was successful with scope: ',reg.scope);
	}).catch(e=>{
		console.log('Error registering service worker: ',e)
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


},{once:true}); //End On Document Load Event


document.ready = function(cb) {
	if (document.readyState=='complete'||document.readyState=='interactive') {
		cb();
		return;
	}
	function ready() {
		document.removeEventListener('SoftLoad',ready);
		document.removeEventListener('DOMContentLoaded',ready);
		cb();
	}
	document.addEventListener('DOMContentLoaded',ready);
	document.addEventListener('SoftLoad',ready);
}