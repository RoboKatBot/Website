"use strict"

ready.then(()=>{
	const input = document.getElementById('upload-input');

	document.getElementById('upload-button').addEventListener('click',()=>{
		input.click();
	});

	input.addEventListener('change',async()=>{
		for(let file of input.files){
			console.log(file)
			const req = new Request(`${location.origin}/upload/`,{method: 'POST', body:file.slice(0), headers:{ filename: file.name }});
			fetch(req);
		}
	});

},{once:true});