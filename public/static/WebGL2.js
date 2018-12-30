"use strict"

var worker = new Worker("./CNNworker.js");

var canvas = document.querySelector('canvas');

var offscreen = canvas.transferControlToOffscreen();

worker.postMessage({canvas:offscreen},[offscreen]);

const canvasObserver = new ResizeObserver(entries=>{
	worker.postMessage({event:'resize',width:canvas.clientWidth,height:canvas.clientHeight});
});

canvasObserver.observe(canvas);

// End Of Initliazation




