"use strict"

var error;

//canvas must be larger then any framebuffer rendered to it (not tested if requirements exist for textures used by canvas)

var gl = new OffscreenCanvas(1000,1000).getContext("webgl2",{premultipliedAlpha: false, antialias: false,preserveDrawingBuffer: true})
gl.disable(gl.DEPTH_TEST);
gl.disable(gl.SCISSOR_TEST);
gl.disable(gl.DITHER);

var ext = gl.getExtension('EXT_color_buffer_float');

class Matrix {
	constructor(arr) {
		this.width = arr[0].length;
		if (arr.filter(k=>k.length!==this.width).length) throw Error('Rigid 2D Matrix required');
		this.height = arr.length;
		this.matrix = arr;
	}
}

class Texture {
	constructor(tex,width,height) {
		this.texture = tex;
		this.width = width;
		this.height = height;
	}
}


//load data into canvas, read pixels from canvas, transfer to gpu

function unrollFactory(inputFeatures,width,height,kwidth,kheight) {
	//if color, inputFeatures should be 3 (unless HSV is concatenated or such)


	var frag = `#version 300 es //take n * m * 3 (ignore alpha channel) image and u*v kernel and produce unrolled matrix
	precision lowp float;

	uniform sampler2D textures[1];
	
	out highp float Output; //fbo of (n+1-u) * (m+1-v) by u*v*α where α is number of input features.

	void main() {
		ivec2 coord = ivec2(gl_FragCoord);
		int featind  = coord.x % ${kwidth*kheight};
		int featNo   = coord.x / ${kwidth*kheight}%${inputFeatures};
		int kernindy = featind / ${kwidth};
		int kernindx = featind % ${kwidth};

		int kernposy = coord.y / ${width+1-kwidth};
		int kernposx = coord.y % ${width+1-kwidth};
		
		lowp float val = texelFetch(textures[0],ivec2(kernposx+kernindx,kernposy+kernindy),0)[featNo];

		//convert to snorm (optional)
		val = 2.* val - 1.;

		Output = val;
	}
	`
	

	return GPGPUFactory(frag,kwidth*kheight*inputFeatures,(width+1-kwidth)*(height+1-kheight));
}

function unrollOutputFactory(inputFeatures,width,height,kwidth,kheight) {
	//unroll inputFeatures coloumns of raw texture data (width*height) 
	// into (-~width-kwidth)*(-~height-kheight) rows of (kwidth*kheight*inputFeatures) 


	const frag = `#version 300 es
	precision lowp float;

	uniform sampler2D textures[1];
	
	out highp float Output; //fbo of (n+1-u) * (m+1-v) by u*v*α where α is number of input features.

	void main() {
		ivec2 coord = ivec2(gl_FragCoord);
		int featind = coord.x%${kwidth*kheight};
		int featNo  = coord.x/${kwidth*kheight}%${inputFeatures};
		int kernindy = featind / ${kwidth};
		int kernindx = featind % ${kwidth};

		int kernposy = coord.y / ${width+1-kwidth};
		int kernposx = coord.y % ${width+1-kwidth};


		int row = kernindx + kernposx + ${width}*(kernposy + kernindy);
		
		lowp float val = texelFetch(textures[0],ivec2(featNo,row),0).r;

		Output = val;
	}
	`
	

	return GPGPUFactory(frag,kwidth*kheight*inputFeatures,(width+1-kwidth)*(height+1-kheight));
}

function flattenFactory(inputFeatures,totalTexels) { //converts inputFeatures coloumns of width*height into 1 wide texture2D to use for FCLayers
	var frag = `#version 300 es
	precision lowp float;

	uniform sampler2D textures[1]; //texture is unrolled at this point -> featureNo coloumns of width*height
	
	out highp float Output; //fbo of width*height*inputFeatures by 1.

	void main() {
		ivec2 coord = ivec2(gl_FragCoord);

		int row     = coord.y / ${inputFeatures};
		int coloumn = coord.y % ${inputFeatures};

		
		lowp float val = texelFetch(textures[0],ivec2(coloumn,row),0).r;

		Output = val;
	}
	`
	

	return GPGPUFactory(frag,totalTexels,1);


}

function matmul(a,b) { // a,b = Matrices
	if (a.width !== b.height) throw(Error("a.width !== b.height"));

	var frag = `#version 300 es
		precision lowp float;

		uniform sampler2D textures[2];
		
		out highp float Output;

		void main() {

			highp float value = 0.;

			for (int i=0;i<${a.width};i++) {

				highp float a = texelFetch(textures[0], ivec2(i,gl_FragCoord.y),0).r;

				highp float b = texelFetch(textures[1], ivec2(gl_FragCoord.x,i),0).r;

				value += a * b;

			}


			Output = value;
		}
	`

	var func = GPGPUFactory(frag,b.width,a.height);

	var aData = Float32Array.from(a.matrix.flat());
	var bData = Float32Array.from(b.matrix.flat());
	var aTex = createTexture(aData,a.width,a.height);
	var bTex = createTexture(bData,b.width,b.height);

	var outTex = func(aTex,bTex);
	var output = readData(b.width,a.height);
	return output;
}

function convolveFuncFactory(aWidth,aHeight,bWidth,activationFunction=`Output = value;`) { // act(a . b + bias)
	var frag = `#version 300 es
		precision lowp float;

		uniform sampler2D textures[3];
		
		out highp float Output;

		void main() {

			highp float value = 0.;

			for (int i=0;i<${aWidth};i++) {

				highp float a = texelFetch(textures[0], ivec2(i,gl_FragCoord.y),0).r; //works for gl_FragCoord === 0

				highp float b = texelFetch(textures[1], ivec2(gl_FragCoord.x,i),0).r;

				value += a * b; //Matrix Multiplication

			}

			value = value + texelFetch(textures[2],ivec2(gl_FragCoord),0).r; //Add Bias

			//normilization?

			`+
			activationFunction
			+`
		}
	`



	return GPGPUFactory(frag,bWidth,aHeight) //usage: outTex = func(a,b,c);
}

function ununrollFactory(inputFeatures,width,height,kwidth,kheight,sum=true) {
	const frag = `#version 300 es
	precision lowp float;

	uniform sampler2D textures[1];

	out highp float Output; // fbo of inputFeatures coloumns of width * height

	void main() {

		int tx = int(gl_FragCoord.y)%${width};
		int ty = int(gl_FragCoord.y)/${width};

		float val;

		for (int i=0;i<${kwidth};i++) {
			int qx = tx - i;
			if (qx<0||qx>=${width-kwidth+1}) {continue;}
			for (int j=0;j<${kheight};j++) {
				int qy = ty - j;
				if (qy<0||qy>=${height-kheight+1}) {continue;}
				val += texelFetch(textures[0],ivec2(
					int(gl_FragCoord.x) * ${kwidth * kheight} + j * ${kwidth} + i,
					qy * ${width+1-kwidth} + qx
					),0).r;
				${sum ? '' : '{break;}'}

			}
			${sum ? '' : '{break;}'}
		}
		Output = val;
	}

	`

	return GPGPUFactory(frag,inputFeatures,width*height);

}

function actDevFactory(width,height,actDevFunction='1;') {

	const frag = `#version 300 es
	precision lowp float;

	uniform sampler2D textures[2];

	out highp float Output;

	void main() {
		ivec2 c = ivec2(gl_FragCoord);

		float val = texelFetch(textures[1],c,0).r;
		float dev = ${actDevFunction}

		Output = dev * texelFetch(textures[0],c,0).r;

	}
	`


	return GPGPUFactory(frag,width,height)
}




function readData(width,height) { //assuming half floats 
	var output = new Uint16Array(Math.ceil(width/2)*2*height);
	gl.readPixels(0,0,width,height,gl.RED,gl.HALF_FLOAT,output); //<--pads to 4 bytes per row (aka 2 values for half floats)
	output = output.filter((_,i)=>(i%(Math.ceil(width/2)*2))<width); //trim padded values
	const ret = new Float64Array(output.length);
	output.forEach((v,i)=>ret[i]=decodeFloat16(v));
	if (error=gl.getError(),error) console.warn('Error reading pixels: ','0x'+error.toString(16));
	return ret;
}


//Global to all GPGPUFactory calls

	var vert = `#version 300 es
		precision lowp float;
		in vec2 aVertexPosition;


		void main() {
			gl_Position = vec4(aVertexPosition,0,1);
		}
	`

	var vertexShader = loadShader(gl.VERTEX_SHADER,vert);

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	var positions = [ 
		1, 	1, 
		1, -1, 
		-1, 1,
		1, -1,
		-1, 1,
		-1,-1];
	gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(positions), gl.STATIC_DRAW);

//End Global

function GPGPUFactory(frag,width,height) {

	var fragShader = loadShader(gl.FRAGMENT_SHADER,frag);

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return function(...textureArray) {

		var output = createTexture(null,width,height);
		bindAsFBO(output.texture);

		gl.useProgram(shaderProgram);
		{
			var aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
			const numComponents = 2;	// pull out 2 values per iteration
			const type = gl.FLOAT;		// the data in the buffer is 32bit floats
			const normalize = false;	// don't normalize
			const stride = 0;				 // how many bytes to get from one set of values to the next
																// 0 = use type and numComponents above
			const offset = 0;				 // how many bytes inside the buffer to start from
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.vertexAttribPointer(
				aVertexPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			gl.enableVertexAttribArray(
				aVertexPosition);
		}

		bindTextures(shaderProgram,textureArray);

		if (error=gl.getError(),error) console.warn('Error after textureBind: ','0x'+error.toString(16));
		gl.drawArrays(gl.TRIANGLES, 0,6);
		if (error=gl.getError(),error) console.warn('Error after draw: ','0x'+error.toString(16));
		return output;
	}
}


function bindTextures(program,textureArray) { //Array of [texture,width,height]
	for (var i=0;i<textureArray.length;i++) {
		gl.activeTexture(gl.TEXTURE0 + i);
		gl.bindTexture(gl.TEXTURE_2D, textureArray[i].texture,textureArray[i].width,textureArray[i].height);
	}
	var textureLoc = gl.getUniformLocation(program, "textures[0]");
	gl.uniform1iv(textureLoc, [...Array(i).keys()]);
}



function createTexture(data,width,height) { //data is a Uint8array
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.texImage2D(gl.TEXTURE_2D,0,gl.R16F,width,height,0,gl.RED,gl.FLOAT,data);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	if (error=gl.getError(),error) console.warn('Error creating texture: ','0x'+error.toString(16));

	return new Texture(texture,width,height);
}

function bindAsFBO(tex) {
	var fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

	gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);

	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==36053) console.warn('Error binding framebuffer: ','0x'+gl.checkFramebufferStatus(gl.FRAMEBUFFER).toString(16))

	return fb;
}



function loadShader(type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);

	gl.compileShader(shader);


	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw Error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

function initShaderProgram(vsSource, fsSource) {
	const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);


	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}

function initBuffers() {
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	positions = [ 
		1, 	1, 
		1, -1, 
		-1, 1,
		1, -1,
		-1, 1,
		-1,-1];
	gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(positions), gl.STATIC_DRAW);

	return {
		position: positionBuffer,
	}
}


//util

function decodeFloat16 (binary) {
	var exponent = (binary & 0x7C00) >> 10,
		fraction = binary & 0x03FF;
	return (binary >> 15 ? -1 : 1) * (
		exponent ?
		(
			exponent === 0x1F ?
			fraction ? NaN : Infinity :
			Math.pow(2, exponent - 15) * (1 + fraction / 0x400)
		) :
		6.103515625e-5 * (fraction / 0x400)
	);
};


function encodeFloat16 (float) {
	var binary;
	if (isNaN(float)) return 0xffff;
	if (float < 0) { 
		float = -float;
		binary |= 0x8000;
	}
	var exponent = 15 + Math.log2(float)|0;
	exponent = Math.max(exponent,0);

	if (exponent === 31 || !isFinite(float)) return binary | 0x7c00;
	binary |= exponent<<10;
	if (exponent !==0) {
		binary |=(float/2**(exponent-15)-1)*0x0400;
	}
	else {
		binary |=(float*2**24);
	}



	return binary;
};