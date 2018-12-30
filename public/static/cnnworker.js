"use strict"

importScripts("./blas.js");

var db;
{
	var req = indexedDB.open('CNN');
	req.onSuccess = (event)=>{
		db = event.target.result;
		db.onerror = console.log;
	}
	
}

addEventListener('message',({data})=>{
	if (data.canvas) {
		main(data.canvas);
	}
	else throw Error('Worker not provided canvas');
},{once:true});


function main(ctx) {

	var [minWidth,minHeight] = [100,100];

	addEventListener('message',(msg)=>{
		var data = msg.data,
			event = data.event;
		switch(event) {
			case 'resize': // one resize event is emitted by default
				requestAnimationFrame(()=>{
					ctx.width = Math.max(data.width,minWidth);
					ctx.height = Math.max(data.height,minHeight);
					render('./icon512.png');
				});
				break;
			default:
				console.warn(`unknown event recieved in worker: ${event}`);
		}
	});


	function render(url) {
		var fetcher = fetch(url).then(res=>
			res.blob()).then(blob=>
			createImageBitmap(blob)).then((img)=>{
			ctx.getContext('2d').drawImage(img,0,0);
		});
	}

}

//dimensions == neuronCount || featureCount    depending on the layer type

class NN {
	//struct = [{type}] - {type:'conv',prevDimensions,dimensions,width,height,kwidth?,kheight?}
	// - {type:'fcc',prevDimensions,dimensions}

	//(old)struct = {convLayers:[...{prevDimensions,dimensions,width,height,kwidth?,kheight?}],FCLayers:[...dimensions]} //ConvLayers[0] should have dimension of the input
	constructor() {
		this.struct;
		this.state = [];
	}
	load() {
		function load(id) {
			var req = db.transaction("CNNData", "readonly").objectStore('CNNData').get(id);
			req.onsuccess = (event)=>{
				// NN.loadNN(req.result.state,req.result.struct,id);
				//load convolutions directly from indexeddb to gpu as textures
				//createTexture(data,width,height)
			};
		}

	}
	save() {
		//read from every texture in CNN (expensive)
		//encode all half floats to uint16array
		//combine with struct
		//save to indexeddb


		// data = {state:NN.NN.getState(),struct:NN.NN.struct};
		if (NN.id) data.id = NN.id
		var req = db.transaction("CNNData", "readwrite").objectStore('CNNData').put(data);
		if (!NN.id) {
			req.onsuccess = function(event) {
				NN.id = event.target.result;
			}
		}

	}
	new(struct) {
		//extend struct for later simplification

		struct[0].prevDimensions = 3;

		for (var i=1;i<struct.length;i++) {
			const layer = struct[i],
				prevLayer = struct[~-i];
			if (layer.type==='conv') {
				[layer.width,layer.height] = [-~prevLayer.width-prevLayer.kwidth,-~prevLayer.height-prevLayer.kheight];
				layer.prevDimensions = prevLayer.dimensions;
				continue;
			}
			if (layer.type==='fc') {
				if (prevLayer.type!=='fc') {
					layer.prevDimensions = prevLayer.dimensions * (-~prevLayer.width-prevLayer.kwidth)*(-~prevLayer.height-prevLayer.kheight);
				}
				else {
					layer.prevDimensions = prevLayer.dimension;
				}
			}
			
		}
		//Error checking

		this.struct = struct;
		this.layers = XavierInitialization(struct);

	}
	guess(ctx) {
		const state = []
		const L1 = this.struct[0];
		if (ctx.width !== L1.width || ctx.height!== L1.height ) throw Error("Input image dimensions do not match in input dimensions of the CNN.");
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		let stateTex = new Texture(texture,L1.width,L1.height);
		state.push(stateTex);
		bindAsFBO(stateTex.texture,stateTex.width,stateTex.height);
		var output = new Uint8Array(28*28*4);
		gl.readPixels(0,0,28,28,gl.RGBA,gl.UNSIGNED_BYTE,output);
		console.log(output)
		for (var i=0;i<this.struct.length;i++) {

			stateTex = this.funcArray[i](stateTex,this.layers[i].kernel,this.layers[i].bias);

			console.log(`State after layer ${i}`,readData(stateTex.width,stateTex.height), ` width:${stateTex.width}, height:${stateTex.height}`)

			state.push(stateTex);//need to store textures for backpropagation
		}
		const outLayer = this.struct[~-i];
		//softmax stateTex
		this.state.push(state);
		// bindAsFBO(stateTex.tex);

		//softmax
		var out = readData(outLayer.dimensions,1);
		out.map(k=>Math.exp(k));
		const geoSize = out.reduce((a,b)=>a+b);




		return out.map(k=>k/geoSize);

	}
	train() {
		var b = new OffscreenCanvas(28,28);
		var ctx = b.getContext('2d');
		{
			ctx.fillStyle = "#ffffffff";
			ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
		}
		const out = this.guess(ctx.getImageData(0,0,28,28));
		const expected = [0,0,0,0,0,0,0,0,0,1];
		const loss = out.reduce((a,b,i)=>a+Math.exp(b) * expected[i]);

		

		

		// glTexImage2D creates the storage for the texture, defining the size/format and removing all previous pixel data. glTexSubImage2D only modifies pixel data within the texture. It can be used to update all the texels, or simply a portion of them.
	}
	prepare() {
		this.funcArray = [];
		this.bpFuncs = [];



		for (var i=0;i<this.struct.length;i++) {
			const layer = this.struct[i];

			if (layer.type==='conv') {
				const unrollFunc = i ? //unrolling RGB image needs to be handeled seperately
					unrollOutputFactory(layer.prevDimensions,layer.width,layer.height,layer.kwidth,layer.kheight):
					unrollFactory(3,layer.width,layer.height,layer.kwidth,layer.kheight);

				const unrolledWidth = layer.kwidth*layer.kheight*layer.prevDimensions,
					unrolledHeight = (layer.width + 1 - layer.kwidth) * (layer.height + 1 - layer.kheight),// === nextLayer.width*nextLayer.height (assuming nextLayer exists) 
					outWidth = layer.dimensions;
				const convolveFunc = convolveFuncFactory(unrolledWidth,unrolledHeight,outWidth,/*activationFunction (GLSL)*/)

				this.funcArray.push((stateTex,kernel,bias)=>convolveFunc(unrollFunc(stateTex),kernel,bias));
				continue;
			}

			if (layer.type==='fc') {
				const convolveFunc = convolveFuncFactory(layer.prevDimensions,1,layer.dimensions,/*activationFunction (GLSL)*/);
				var func;
				if (this.struct[~-i].type!=='fc') {
					const prev = this.struct[~-i];
					const flattenFunc = flattenFactory(prev.dimensions,layer.prevDimensions);
					func = (stateTex,kernel,bias)=>convolveFunc(flattenFunc(stateTex),kernel,bias);
				}
				else {
					func = (stateTex,kernel,bias)=>convolveFunc(stateTex,kernel,bias);
				}
				
				this.funcArray.push(func);
				continue;
			}
			
		}

		// for (var i=0;i<this.struct.length;i++) {
		// 	const layer = this.struct[i];



		// 	this.bpFuncs.push((state)=>{
		// 		//
		// 	})
		// }







		
	}
}


function XavierInitialization(structure) {  //Xavier Initialization assumes input has zero mean and unity variance
	const layers = [];


	for (var i=0;i<structure.length;i++) {
		const layer = structure[i];
		var kernel,bias;

		if (layer.type==='conv') {
			{	//kernel initilization
				const width = layer.dimensions;
				const height = layer.prevDimensions*layer.kwidth*layer.kheight;

				const data = new Float32Array(height*width).map(_=>normalRandom(0,layer.prevDimensions**-1));
				kernel = createTexture(data,width,height);
			}

			{	//bias initilization
				const width = layer.dimensions;
				const height = (layer.width + 1 - layer.kwidth) * (layer.height + 1 - layer.kheight);
				const data = new Float32Array(height*width)/*.map(_=>normalRandom(0,1/layer.prevDimensions))*/;
				bias = createTexture(data,width,height);
			}

		}
		else if (layer.type==='fc') {
			{
				const height = layer.prevDimensions;
				const width  = layer.dimensions;
				const data = new Float32Array(width*height).map(_=>normalRandom(0,layer.prevDimensions**-1));
				kernel = createTexture(data,width,height);
			}
			{
				const width = layer.dimensions;
				const data = new Float32Array(width*1)/*.map(_=>normalRandom(0,1/layer.prevDimensions))*/;
				bias = createTexture(data,1,width);
			}

		}
		// bindAsFBO(bias.texture);
		// console.log(`Bias for layer ${i}`,readData(bias.width,bias.height));
		// bindAsFBO(kernel.texture);
		// console.log(`Kernel for layer ${i}`,readData(kernel.width,kernel.height));


		layers.push({kernel, bias});
	}
	return layers;
}

function normalRandom(mean=0,variance=1) {
	var u = 0, v = 0;
	while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	while(v === 0) v = Math.random();
	return variance * Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v ) + mean;
}


/*
things to maybe implement

cpu version

non 16 bit depth

HSV pre processing

data augmentation

momentum
	NAG

ADADELTA

Softmax, Cross Entropy

Activations:
	Sigmoid
	tanh
	RELU
	SELU
	*/
`Output = exp(value) / (exp(value) + 1.)`



	/*


Batch normalization

Regularization

pool layers / stride

dropout

weight decay




*/