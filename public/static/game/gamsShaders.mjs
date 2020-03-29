//Implement transfrom feedback shaders for particles

const renderVertexShader = `
#version 300 es

//uniforms

void main(void) {
	gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
}
`

const renderFragmentShader = `
#version 300 es

//uniforms

void main(void) {
	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`



export {
	renderVertexShader,
	renderFragmentShader
}