"use strict";

ready.then(_=>{
	const BGs = document.getElementsByClassName("super-bg"),
	Super = document.querySelector(".super");
	var prevBG = 0;
	document.addEventListener('scroll',()=>{
		var activeBG = ~~(document.documentElement.scrollTop/(Super.scrollHeight/BGs.length));
		if(activeBG !==prevBG) {
			BGs[activeBG].style.opacity = 1;
			BGs[prevBG].style.opacity = 0;
			prevBG = activeBG;
		}
	});
});