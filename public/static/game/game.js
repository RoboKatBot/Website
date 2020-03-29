"use strict";

const ready = new Promise((res)=>{
	document.addEventListener('DOMContentLoaded',res);
})


ready.then(_=>{
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


},{once:true})
	.then(_=>{
		a = new main();
	});

let a;





class main {
	constructor() {
		this.canvas = document.querySelector("#glCanvas");
		this.gl = this.canvas.getContext("webgl2",{antialias: false, preserveDrawingBuffer: 0});
		new ResizeObserver(this.resize.bind(this)).observe(this.canvas);

		const shaderProgram = initShaderProgram(this.gl, vsSource, fsSource);
		this.programInfo = getProgramInfo(this.gl,shaderProgram);
		this.buffers = initBuffers(this.gl);
		this.texture = loadTexture(this.gl, '/icon512.png');



		requestAnimationFrame(this.drawScene.bind(this));
	}
	resize() {
		this.canvas.width  = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}
	drawScene(time) {
		let rot = time*0.003;
		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);				// Clear to black, fully opaque
		this.gl.clearDepth(1.0);								// Clear everything
		this.gl.enable(this.gl.DEPTH_TEST);					 	// Enable depth testing
		this.gl.depthFunc(this.gl.LEQUAL);						// Near things obscure far things

		this.gl.disable(this.gl.SCISSOR_TEST);
		this.gl.disable(this.gl.DITHER);

		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		// Create a perspective matrix, a special matrix that is
		// used to simulate the distortion of perspective in a camera.
		// Our field of view is 45 degrees, with a width/height
		// ratio that matches the display size of the canvas
		// and we only want to see objects between 0.1 units
		// and 100 units away from the camera.

		const fieldOfView = 45 * Math.PI / 180;	 // in radians
		const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
		const zNear = 0.1;
		const zFar = 100.0;
		const projectionMatrix = mat4.create();

		// note: glmatrix.js always has the first argument
		// as the destination to receive the result.
		mat4.perspective(projectionMatrix,
			fieldOfView,
			aspect,
			zNear,
			zFar);

		// Set the drawing position to the "identity" point, which is
		// the center of the scene.
		const modelViewMatrix = mat4.create();

		// Now move the drawing position a bit to where we want to
		// start drawing the square.


		mat4.translate(modelViewMatrix,		 // destination matrix
			modelViewMatrix,		 // matrix to translate
			[0*Math.cos(rot), 0*Math.sin(rot), -8.0-3*Math.sin(0.1*rot)]);	// amount to translate

		mat4.rotate(modelViewMatrix,	// destination matrix
			modelViewMatrix,	// matrix to rotate
			rot,	 // amount to rotate in radians
			[1,1,0.1]);		 // axis to rotate around
		
		// Tell WebGL how to pull out the positions from the position
		// buffer into the vertexPosition attribute.
		{
			const numComponents = 3;	// pull out 2 values per iteration
			const type = this.gl.FLOAT;		// the data in the buffer is 32bit floats
			const normalize = false;	// don't normalize
			const stride = 0;				 // how many bytes to get from one set of values to the next
																// 0 = use type and numComponents above
			const offset = 0;				 // how many bytes inside the buffer to start from
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
			this.gl.vertexAttribPointer(
				this.programInfo.attribLocations.vertexPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			this.gl.enableVertexAttribArray(
				this.programInfo.attribLocations.vertexPosition);
		}

		{
			const numComponents = 3;
			const type = this.gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normal);
			this.gl.vertexAttribPointer(
				this.programInfo.attribLocations.vertexNormal,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			this.gl.enableVertexAttribArray(
				this.programInfo.attribLocations.vertexNormal);
		}


		{
			const numComponents = 2
			const type = this.gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.textureCoord);
			this.gl.vertexAttribPointer(
				this.programInfo.attribLocations.textureCoord,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			this.gl.enableVertexAttribArray(
				this.programInfo.attribLocations.textureCoord);
		}

		const normalMatrix = mat4.create();
		mat4.invert(normalMatrix, modelViewMatrix);
		mat4.transpose(normalMatrix, normalMatrix);



		// Tell WebGL to use our program when drawing
		this.gl.useProgram(this.programInfo.program);


		// Tell WebGL we want to affect texture unit 0
		this.gl.activeTexture(this.gl.TEXTURE0);

		// Bind the texture to texture unit 0
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

		// Tell the shader we bound the texture to texture unit 0
		this.gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);



		// Set the shader uniforms

		this.gl.uniformMatrix4fv(
			this.programInfo.uniformLocations.normalMatrix,
			false,
			normalMatrix);

		this.gl.uniformMatrix4fv(
			this.programInfo.uniformLocations.projectionMatrix,
			false,
			projectionMatrix
		);
		this.gl.uniformMatrix4fv(
			this.programInfo.uniformLocations.modelViewMatrix,
			false,
			modelViewMatrix
		);

		{
			const vertexCount = 36;
			const type = this.gl.UNSIGNED_SHORT;
			const offset = 0;
			this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
		}

		requestAnimationFrame(this.drawScene.bind(this));
	}

}




const vsSource = `
	attribute vec4 aVertexPosition;
	attribute vec2 aTextureCoord;

	uniform mat4 uModelViewMatrix;
	uniform mat4 uNormalMatrix;
	uniform mat4 uProjectionMatrix;

	varying highp vec2 vTextureCoord;

	void main(void) {
		gl_Position = (uProjectionMatrix * uModelViewMatrix * aVertexPosition).xyzw;
		vTextureCoord = aTextureCoord;
	}
`;

const fsSource = `
	varying highp vec2 vTextureCoord;

	uniform sampler2D uSampler;


	void main(void) {
		highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
		gl_FragColor = texelColor;
	}
`;

function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	// Create the shader program

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}

function loadShader(gl, type, source) {
	const shader = gl.createShader(type);

	// Send the source to the shader object

	gl.shaderSource(shader, source);

	// Compile the shader program

	gl.compileShader(shader);

	// See if it compiled successfully

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

function getProgramInfo(gl,shaderProgram) {
	return {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
			textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
			normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
			uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
		},
	};
}


function initBuffers(gl) {

	// Create a buffer for the square's positions.

	const positionBuffer = gl.createBuffer();

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// Now create an array of positions for the square.

	const positions = [
		// Front face
		-1.0, -1.0,	1.0,
		 1.0, -1.0,	1.0,
		 1.0,	1.0,	1.0,
		-1.0,	1.0,	1.0,
		
		// Back face
		-1.0, -1.0, -1.0,
		-1.0,	1.0, -1.0,
		 1.0,	1.0, -1.0,
		 1.0, -1.0, -1.0,
		
		// Top face
		-1.0,	1.0, -1.0,
		-1.0,	1.0,	1.0,
		 1.0,	1.0,	1.0,
		 1.0,	1.0, -1.0,
		
		// Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,	1.0,
		-1.0, -1.0,	1.0,
		
		// Right face
		 1.0, -1.0, -1.0,
		 1.0,	1.0, -1.0,
		 1.0,	1.0,	1.0,
		 1.0, -1.0,	1.0,
		
		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,	1.0,
		-1.0,	1.0,	1.0,
		-1.0,	1.0, -1.0,
	];


	// Now pass the list of positions into WebGL to build the
	// shape. We do this by creating a Float32Array from the
	// JavaScript array, then use it to fill the current buffer.

	gl.bufferData(gl.ARRAY_BUFFER,
		new Float32Array(positions),
		gl.STATIC_DRAW);


	const textureCoordinates = [
		 // Front
		 0.0,	0.0,
		 1.0,	0.0,
		 1.0,	1.0,
		 0.0,	1.0,
		 // Back
		 0.0,	0.0,
		 1.0,	0.0,
		 1.0,	1.0,
		 0.0,	1.0,
		 // Top
		 0.0,	0.0,
		 1.0,	0.0,
		 1.0,	1.0,
		 0.0,	1.0,
		 // Bottom
		 0.0,	0.0,
		 1.0,	0.0,
		 1.0,	1.0,
		 0.0,	1.0,
		 // Right
		 0.0,	0.0,
		 1.0,	0.0,
		 1.0,	1.0,
		 0.0,	1.0,
		 // Left
		 0.0,	0.0,
		 1.0,	0.0,
		 1.0,	1.0,
		 0.0,	1.0,
	];


	const textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
									gl.STATIC_DRAW);
/*
	const faceColors = [
		[1.0,	1.0,	1.0,	1.0],	// Front face: white
		[1.0,	0.0,	0.0,	1.0],	// Back face: red
		[0.0,	1.0,	0.0,	1.0],	// Top face: green
		[0.0,	0.0,	1.0,	1.0],	// Bottom face: blue
		[1.0,	1.0,	0.0,	1.0],	// Right face: yellow
		[1.0,	0.0,	1.0,	1.0],	// Left face: purple
	];

		// Convert the array of colors into a table for all the vertices.

	var colors = [];

	for (var j = 0; j < faceColors.length; ++j) {
		const c = faceColors[j]
		// Repeat each color four times for the four vertices of the face
		colors = colors.concat(c, c, c, c);
	}

	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);*/

	const normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

	const vertexNormals = [
		// Front
		 0.0,	0.0,	1.0,
		 0.0,	0.0,	1.0,
		 0.0,	0.0,	1.0,
		 0.0,	0.0,	1.0,

		// Back
		 0.0,	0.0, -1.0,
		 0.0,	0.0, -1.0,
		 0.0,	0.0, -1.0,
		 0.0,	0.0, -1.0,

		// Top
		 0.0,	1.0,	0.0,
		 0.0,	1.0,	0.0,
		 0.0,	1.0,	0.0,
		 0.0,	1.0,	0.0,

		// Bottom
		 0.0, -1.0,	0.0,
		 0.0, -1.0,	0.0,
		 0.0, -1.0,	0.0,
		 0.0, -1.0,	0.0,

		// Right
		 1.0,	0.0,	0.0,
		 1.0,	0.0,	0.0,
		 1.0,	0.0,	0.0,
		 1.0,	0.0,	0.0,

		// Left
		-1.0,	0.0,	0.0,
		-1.0,	0.0,	0.0,
		-1.0,	0.0,	0.0,
		-1.0,	0.0,	0.0
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
									gl.STATIC_DRAW);







	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	 // This array defines each face as two triangles, using the
	 // indices into the vertex array to specify each triangle's
	 // position.

	const indices = [
		 0,	1,	2,		0,	2,	3,	// front
		 4,	5,	6,		4,	6,	7,	// back
		 8,	9,	10,	 8,	10, 11,	 // top
		 12, 13, 14,	 12, 14, 15,	 // bottom
		 16, 17, 18,	 16, 18, 19,	 // right
		 20, 21, 22,	 20, 22, 23,	 // left
	];

	 // Now send the element array to GL

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices), gl.STATIC_DRAW)

	return {
		position: positionBuffer,
		textureCoord: textureCoordBuffer,
		normal: normalBuffer,
		indices: indexBuffer,
	};
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Because images have to be download over the internet
	// they might take a moment until they are ready.
	// Until then put a single pixel in the texture so we can
	// use it immediately. When the image has finished downloading
	// we'll update the texture with the contents of the image.
	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 255, 150]);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
								width, height, border, srcFormat, srcType,
								pixel);

	const image = new Image();
	image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
									srcFormat, srcType, image);

		// WebGL1 has different requirements for power of 2 images
		// vs non power of 2 images so check if the image is a
		// power of 2 in both dimensions.
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			// Yes, it's a power of 2. Generate mips.
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			// No, it's not a power of 2. Turn of mips and set
			// wrapping to clamp to edge
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	};
	image.src = url;

	return texture;
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}





function init2() {
	//init VAO's and shaders
}

function setupParticleBufferVAO(gl, buffers, vao) {
	gl.bindVertexArray(vao);
	for (var i = 0; i < buffers.length; i++) {
		var buffer = buffers[i];
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer_object);
		var offset = 0;
		for (var attrib_name in buffer.attribs) {
			if (buffer.attribs.hasOwnProperty(attrib_name)) {
				var attrib_desc = buffer.attribs[attrib_name];
				gl.enableVertexAttribArray(attrib_desc.location);
				gl.vertexAttribPointer(
					attrib_desc.location,
					attrib_desc.num_components,
					attrib_desc.type,
					false, 
					buffer.stride,
					offset);
				var type_size = 4; /* we're only dealing with types of 4 byte size in this demo, unhardcode if necessary */
				offset += attrib_desc.num_components * type_size; 
				if (attrib_desc.hasOwnProperty("divisor")) {
					gl.vertexAttribDivisor(attrib_desc.location, attrib_desc.divisor);
				}
			}
		}
	}
	gl.bindVertexArray(null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
