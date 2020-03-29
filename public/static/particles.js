import * as Controls from '/controls.mjs'




var particle_tex = 
//`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAkFBMVEUAAAD/5QD/5wDp0QA/OQDu1gBaUQD/6QD/6wD/7ADz2gD74QD/7gD43wDlzQDXwQB0aACAcwDHswDcxgBEPQBpXgAFBQCXiAAqJgCnlgAZFwAUEgBIQQAlIQCunAC0oQBdVAC7qADDrwBPRwCNfgAzLgA5NACEdgCejgApJQBvZAAdGgCBdAB4awA1LwAODQDm1dB6AAAEbklEQVR4nO2dAV/aMBDFzWFJrQKCIsNtCMjUuTm//7dbUucmE0qbthx5vv8X4L3fhVyaXC5HR4QQQgghhBBCCCGEEEIIIYQQQghZ5/JRW0HbdLPRpbaGdukmJ9n9J20VbdJNRM6Wc20ZLeIcGpMmk2NtIa2ROzRiRufaStrixaERSW5A/41/HPowdsbaYlrhr0MXRru80pbTAv8cOtLs6Ye2oMZZc+iG6qKrrahp1h0aSfsTsBnnP4fGWDPCmnHeOXRh7EyvtWU1yHuH/t84AArjJocucZzihHGjQ+fxJBl/1tbWDFscOo9nM4wPx60OXf7vDxESR4FDY08Xc2199Sly6Gac/iT6GafQoQtjb3CrLbEmOxz6xPGgrbEeuxzmS9WoV+O7HfoZZxrxNk4Zhy6Mg2G0+b+UQz/j3MQ645R06MO40tYaRlmHPozLKMNY3qHfcYwxjBUc5kP1i7bgylRy6IZquoptNV7RoftwHIzjWqpWdejCmE2jGqrVHfptnJ/asisQ4NCHcRnPvzHIoU8cQ23lZQlzmJ84ftPWXo5Qhy43Zquv2urLEOzQe4xi/7+GQ3/+/3D4Q7WWQx/Gp+CfPt4Ld+dZHYcucSSzu0CHnf2Q1PLnw2guAss4ZE/UdehyoyyCtjhq//L+kNSEHONoy66EpIvbynUc2qIrYjurX9gOjT2tmv+1FVdGbGdWaaRqCw7AJY45tkMXxt4M22FeqvJYdqhqaw3F2rL7/9pKwznp35eq/9PWWQMrN3Nsh27G6U92f/9rq6yH9EY7D461NdZEpLfr/F9bYm3EJsVn49oCG0DSadFqXFteE0h68bR9xtFW1ww2257/tbU1hNiLCbZDf/4/2nwapy2sOUQ6G8OoratJRDbV/2mrahZrJu/2/7U1NYycDcZX0A79VtXDF2yH/t+4Vv+nracNbLa4xHbor3HeYzvMS1XAHbplnFldQzv0HkfzZ2iH+fn/JbZDX+J4Be0QPYbo/0P4uRQ9H8KvadDXpfDfFujfh/Df+Oj7NOh7bfD7peh73vDnFuhnTy6A2OeH6GfAYpPiGndtgTWBr8Ww4PU08DVR6HVtgl6b6AJY8pqwttIw0GuExWbYdd7otfrw9y3g78zYzqrqhVltyZVAv7sWeP8wqjukz9X9fYR7wPh3ufeE4n38PcGeCsUBhO6LAd/bBL0/jUhy8DPMKyEOBb1PlJhBNE2ijtivbUMA0XvuofdNlHQQXyd69i99M0DBe9DC9xG2vbJ79QcH+3nnAQTvyY7eV1/kdFvFTyTsft8i1hnmlZ1vlEQ7w7xS+M5MbzHX1leforeCLobfteU1QMF7T9P4Vtmb2PpmV2ccdBhxeGx9dy36GeaVj/h2Hvz7h+hvWPp3SBFSxBs+2Fuy4O8Bi9iFtpo2+DDvcosks9i2ekvy4lDMKLCg4vDJHabJ5MALKmrgHMrZcq4to0W6yUl2D5bj1+lmo4h3CstwjJkiCCGEEEIIIYQQQgghhBBCCCGEkEb5DR1bbyE7+gy1AAAAAElFTkSuQmCC`
// `data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8AAAD/EAAA/0AAAP9AAAD/cAAA/4AAAP+AAAD/gAAA/4AAAP+AAAD/QAAA/0AAAP8Q////AP///wD///8AAAD/YAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA/2D///8AAAD/MAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD/MAAA/1AAAP//AAD//wAA//8AAP//AAD//wAA//8QEP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA/2AAAP+AAAD//wAA//8AAP//AAD//wAA//8AAP//4OD//1BQ//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP+AAAD/gAAA//8AAP//AAD//wAA//8AAP//AAD/////////////wMD//yAg//8AAP//AAD//wAA//8AAP//AAD/gAAA/4AAAP//AAD//wAA//8AAP//AAD//wAA/////////////7Cw//8gIP//AAD//wAA//8AAP//AAD//wAA/4AAAP+AAAD//wAA//8AAP//AAD//wAA//8AAP//4OD//0BA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP+AAAD/UAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD/YAAA/zAAAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA/zD///8AAAD/YAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA/2D///8A////AP///wAAAP8QAAD/QAAA/0AAAP+AAAD/gAAA/4AAAP+AAAD/gAAA/4AAAP9AAAD/QAAA/xD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A//8AAP//AADAAwAAgAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAMADAAD//wAA//8AAA==`
//`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QYTCCY1R1556QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAC4ElEQVRYw8VXa4/aMBAcB0OgB0ff///vVWpV0UAOcBz3w832hr0EyLVSLa0S7mLPePbhdcAbRykl2HsIobx1nTARMIzMVQJlCqEwATgAmMmcSj7rhUjm8y4iYQLwjKDxCoGO7/leIuEKeCXAkTZzZiM762j2ux8jEW+Az2kRwIIWxSA7NzvTZgCSrDtIIt4Ar/lcAVjSjNBcpiaCJwBH2pNz0yCJOOASBV/yueb7O5qpYcN23YpqAcDJC+wy5oXAwO4XBH0AsAGwJZG1/M/GkQT2tJ1sqFcrpVwEpSpQSZSb7Ab+HsAHIbKhMjZOABr+bTFQI7LLjHxBQFLO734l4F8APPK5ohI29iRWO2U0MC07+mcRnlWIIpWmXS0+3xB4C+ArgM/iCiWw5xrm+44xkfjbMiPTHYMEouT9gi5YO/BPVMRSsuM3P51LLCae3LqdumgsC6LLhC3VeATwkU9LSUu9wPeW3zeSxtGV8ZcsEP9X4oYosVC7gKxJ5kEIVNz1hsArCUglYBjB4iCOlGe1SpSpJM9tdxXlnssGdJ7a7VJ8x7Ag6giiB9DkEUMIpZRSXMHIUlq1yrUMOPW5xUCSb2xOkkNJ1y8+Df0OFdyKzJZRXYvPo+T5TqK+kUxQEqMusBrdOQItgAMXX4p/E4MwcN6BoD8AfOf3B6kDuu7FeaAEtJE40Vou7Gv/nhFvo6EbvhG8obWyVvZF6A8BxoH5J3GnR/5/5ypcIvjOHUYNi5E9d3THUVzR++YkurbKy++7prP425+GRmJPAr/43g4E4+s0pAomU5KioQfLgTbWD+wlE8wtploGkG81JBaIcOc5JNq16dCOyLLGuqFWsihJAI4XIlEBzjW9LB6lvKo6BnISRS7S8GZPOEJCY+N8R1fciSL5Gvg99wJ/QFUi/dC9IEmZzkNR/5abUTVwII0R6KXt6kMI/T+5G7pbUrhyNyxTrmWTLqcDt+JXBP7mlvzfxm8amZhMH7WSmQAAAABJRU5ErkJggg==`;
`data:image/png;base64,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`

function createShader(gl, shader_info) {
	var shader = gl.createShader(shader_info.type);
	var i = 0;
	gl.shaderSource(shader, shader_info.content.trim());
	gl.compileShader(shader);
	var compile_status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!compile_status) {
		var error_message = gl.getShaderInfoLog(shader);
		throw "Could not compile shader \"" +
					shader_info.name +
					"\" \n" +
					error_message;
	}
	return shader;
}

/* Creates an OpenGL program object.
	 `gl' shall be a WebGL 2 context.
	 `shader_list' shall be a list of objects, each of which have a `name'
			and `type' properties. `name' will be used to locate the script tag
			from which to load the shader. `type' shall indicate shader type (i. e.
			gl.FRAGMENT_SHADER, gl.VERTEX_SHADER, etc.)
	`transform_feedback_varyings' shall be a list of varying that need to be
		captured into a transform feedback buffer.*/
function createGLProgram(gl, shader_list, transform_feedback_varyings) {
	var program = gl.createProgram();
	for (var i = 0; i < shader_list.length; i++) {
		var shader_info = shader_list[i];
		var shader = createShader(gl, shader_info);
		gl.attachShader(program, shader);
	}

	/* Specify varyings that we want to be captured in the transform
		 feedback buffer. */
	if (transform_feedback_varyings != null) {
		gl.transformFeedbackVaryings(program,
																 transform_feedback_varyings,
																 gl.INTERLEAVED_ATTRIBS);
	}
	gl.linkProgram(program);
	var link_status = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!link_status) {
		var error_message = gl.getProgramInfoLog(program);
		throw "Could not link program.\n" + error_message;
	}
	return program;
}

function randomRGData(size_x, size_y) {
	var d = [];
	for (var i = 0; i < size_x * size_y; ++i) {
		d.push(Math.random() * 255.0);
		d.push(Math.random() * 255.0);
	}
	return new Uint8Array(d);
}

function initialParticleData(num_parts, min_age, max_age) {
	var data = [];
	for (var i = 0; i < num_parts; ++i) {
		data.push(0.0);
		data.push(0.0);
		var life = min_age + Math.random() * (max_age - min_age);
		data.push(life + 1);
		data.push(life);
		data.push(0.0);
		data.push(0.0);
	}
	return data;
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

function init(
		gl,
		num_particles,
		particle_birth_rate,
		min_age,
		max_age, 
		min_theta,
		max_theta,
		min_speed,
		max_speed,
		gravity,
		part_img) { // Note the new parameter.
	if (max_age < min_age) {
		throw "Invalid min-max age range.";
	}
	if (max_theta < min_theta ||
			min_theta < -Math.PI ||
			max_theta > Math.PI) {
		throw "Invalid theta range.";
	}
	if (min_speed > max_speed) {
		throw "Invalid min-max speed range.";
	}
	var update_program = createGLProgram(
		gl,
		[
			{content: particle_update_vert, type: gl.VERTEX_SHADER},
			{content: passthru_frag_shader, type: gl.FRAGMENT_SHADER},
		],
		[
			"v_Position",
			"v_Age",
			"v_Life",
			"v_Velocity",
		]);
	var render_program = createGLProgram(
		gl,
		[
			{content: particle_render_vert, type: gl.VERTEX_SHADER},
			{content: particle_render_frag, type: gl.FRAGMENT_SHADER},
		],
		null);
	var update_attrib_locations = {
		i_Position: {
			location: gl.getAttribLocation(update_program, "i_Position"),
			num_components: 2,
			type: gl.FLOAT
		},
		i_Age: {
			location: gl.getAttribLocation(update_program, "i_Age"),
			num_components: 1,
			type: gl.FLOAT
		},
		i_Life: {
			location: gl.getAttribLocation(update_program, "i_Life"),
			num_components: 1,
			type: gl.FLOAT
		},
		i_Velocity: {
			location: gl.getAttribLocation(update_program, "i_Velocity"),
			num_components: 2,
			type: gl.FLOAT
		}
	};
	var render_attrib_locations = {
		i_Position: {
			location: gl.getAttribLocation(render_program, "i_Position"),
			num_components: 2,
			type: gl.FLOAT,
			divisor: 1
		},
		i_Age: {
			location: gl.getAttribLocation(render_program, "i_Age"),
			num_components: 1,
			type: gl.FLOAT,
			divisor: 1
		},
		i_Life: {
			location: gl.getAttribLocation(render_program, "i_Life"),
			num_components: 1,
			type: gl.FLOAT,
			divisor: 1
		}
	};
	var vaos = [
		gl.createVertexArray(),
		gl.createVertexArray(),
		gl.createVertexArray(),
		gl.createVertexArray(),
	];
	var buffers = [
		gl.createBuffer(),
		gl.createBuffer(),
	];
	var sprite_vert_data =
		new Float32Array([
			1, 1,
			1, 1,

			-1, 1,
			0, 1,
			
			-1, -1,
			0, 0,
			
			1, 1,
			1, 1,
			
			-1, -1,
			0, 0,
			
			1, -1,
			1, 0]);
	var sprite_attrib_locations = {
		i_Coord: {
			location: gl.getAttribLocation(render_program, "i_Coord"),
			num_components: 2,
			type: gl.FLOAT,
		},
		i_TexCoord: {
			location: gl.getAttribLocation(render_program, "i_TexCoord"),
			num_components: 2,
			type: gl.FLOAT
		}
	};
	var sprite_vert_buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sprite_vert_buf);
	gl.bufferData(gl.ARRAY_BUFFER, sprite_vert_data, gl.STATIC_DRAW);
	var vao_desc = [
		{
			vao: vaos[0],
			buffers: [{
				buffer_object: buffers[0],
				stride: 4 * 6,
				attribs: update_attrib_locations
			}]
		},
		{
			vao: vaos[1],
			buffers: [{
				buffer_object: buffers[1],
				stride: 4 * 6,
				attribs: update_attrib_locations
			}]
		},
		{
			vao: vaos[2],
			buffers: [{
				buffer_object: buffers[0],
				stride: 4 * 6,
				attribs: render_attrib_locations
			},
			{
				buffer_object: sprite_vert_buf,
				stride: 4 * 4,
				attribs: sprite_attrib_locations
			}],
		},
		{
			vao: vaos[3],
			buffers: [{
				buffer_object: buffers[1],
				stride: 4 * 6,
				attribs: render_attrib_locations
			},
			{
				buffer_object: sprite_vert_buf,
				stride: 4 * 4,
				attribs: sprite_attrib_locations
			}],
		},
	];
	var initial_data =
		new Float32Array(initialParticleData(num_particles, min_age, max_age));
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
	gl.bufferData(gl.ARRAY_BUFFER, initial_data, gl.STREAM_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers[1]);
	gl.bufferData(gl.ARRAY_BUFFER, initial_data, gl.STREAM_DRAW);
	for (var i = 0; i < vao_desc.length; i++) {
		setupParticleBufferVAO(gl, vao_desc[i].buffers, vao_desc[i].vao);
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	var particle_tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, particle_tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, part_img.width, part_img.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, part_img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	return {
		particle_sys_buffers: buffers,
		particle_sys_vaos: vaos,
		read: 0,
		write: 1,
		particle_update_program: update_program,
		particle_render_program: render_program,
		num_particles: initial_data.length / 6,
		old_timestamp: 0.0,
		total_time: 0.0,
		born_particles: 0,
		birth_rate: particle_birth_rate,
		gravity: gravity,
		origin: [0.0, 0.0],
		min_theta: min_theta,
		max_theta: max_theta,
		min_speed: min_speed,
		max_speed: max_speed,
		particle_tex: particle_tex
	};
}

function render(gl, controls, state, timestamp_millis) {

	const s = controls.getValue();

	if (s.pause) return;


	var num_part = state.born_particles;
	var time_delta = 0.0;
	if (state.old_timestamp != 0) {
		time_delta = timestamp_millis - state.old_timestamp;
		if (time_delta > 500.0) {
			time_delta = 0.0;
		}
	}
	
	state.old_timestamp = timestamp_millis;
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(state.particle_update_program);

	gl.uniform1f(
		gl.getUniformLocation(state.particle_update_program, "u_kill"),
		s.kill||0);
	if (s.kill) {
		num_part = state.num_particles;
		state.born_particles = 0;

	}

	gl.uniform1f(
		gl.getUniformLocation(state.particle_update_program, "u_timeDelta"),
		1);
	gl.uniform1f(
		gl.getUniformLocation(state.particle_update_program, "u_totalTime"),
		state.total_time);
	gl.uniform2f(
		gl.getUniformLocation(state.particle_update_program, "u_origin"),
		state.origin[0],
		state.origin[1]);
	//Position
	if(s.Generation.Position.selected==='Radial') {
		gl.uniform1f(
			gl.getUniformLocation(state.particle_update_program, "u_radiusMean"),
			s.Generation.Position.Radial['radiusMean']);
		gl.uniform1f(
			gl.getUniformLocation(state.particle_update_program, "u_radiusRange"),
			s.Generation.Position.Radial['radiusRange']);
		gl.uniform1f(
			gl.getUniformLocation(state.particle_update_program, "u_thetaMean"),
			s.Generation.Position.Radial['thetaMean']/180*Math.PI);
		gl.uniform1f(
			gl.getUniformLocation(state.particle_update_program, "u_thetaRange"),
			s.Generation.Position.Radial['thetaRange']/180*Math.PI);
	}
	// else {}




	gl.uniform1f(
		gl.getUniformLocation(state.particle_update_program, "u_lifespanMean"),
		s.Generation.Lifespan.lifespanMean);
	gl.uniform1f(
		gl.getUniformLocation(state.particle_update_program, "u_lifespanRange"),
		s.Generation.Lifespan.lifespanRange);
	if (state.born_particles < state.num_particles) {
		state.born_particles = Math.min(state.num_particles, state.born_particles + s.Generation.spawnRate);
	}



	//Dynamics
	gl.uniform1f(
		gl.getUniformLocation(state.particle_update_program, "u_friction"),
		1-s.Dynamics.friction/100);


	state.total_time++;

	//Move This
	


	gl.bindVertexArray(state.particle_sys_vaos[state.read]);
	gl.bindBufferBase(
		gl.TRANSFORM_FEEDBACK_BUFFER, 0, state.particle_sys_buffers[state.write]);
	gl.enable(gl.RASTERIZER_DISCARD);
	gl.beginTransformFeedback(gl.POINTS);
	gl.drawArrays(gl.POINTS, 0, num_part);
	gl.endTransformFeedback();
	gl.disable(gl.RASTERIZER_DISCARD);
	gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
	gl.bindVertexArray(state.particle_sys_vaos[state.read + 2]);
	gl.useProgram(state.particle_render_program);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, state.particle_tex);

	//Appearence
	gl.uniform1f(
		gl.getUniformLocation(state.particle_render_program, "u_startSize"),
		s.Appearence.Size.startSize);
	gl.uniform1f(
		gl.getUniformLocation(state.particle_render_program, "u_endSize"),
		s.Appearence.Size.endSize);

	gl.uniform3f(
		gl.getUniformLocation(state.particle_render_program, "u_base"),
		...colourToVec(s.Appearence.Colours.base));
	gl.uniform1f(
		gl.getUniformLocation(state.particle_render_program, "u_transparency"),
		s.Appearence.Colours.transparency);

	gl.uniform1i(
		gl.getUniformLocation(state.particle_render_program, "u_Sprite"),
		0);
	gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, num_part);
	var tmp = state.read;
	state.read = state.write;
	state.write = tmp;
	window.requestAnimationFrame(function(ts) { render(gl, controls, state, ts); });
}

function main() {


	const controls = init2();


	const canvas = document.querySelector(".ParticleCanvas");
	const gl = canvas.getContext("webgl2");
	new ResizeObserver(resize).observe(canvas);
	if (gl != null) {
		var part_img = new Image();
		part_img.src = particle_tex;
		part_img.onload = function () {
			var state =
				init(
					gl,
					100,
					0.1,
					1000.0, 1000.0,
					-Math.PI, Math.PI,
					0.5, 0.5,
					[0.0, 0.0],
					part_img);
			canvas.onmousemove = function(e) {
				var x = 2.0 * (e.pageX - this.offsetLeft)/this.width - 1.0; 
				var y = -(2.0 * (e.pageY - this.offsetTop)/this.height - 1.0);
				state.origin = [x, y];
			};
			window.requestAnimationFrame(
				function(ts) { render(gl, controls, state, ts); });
		}
	} else {
		document.write("WebGL2 is not supported by your browser");
	}


	function resize() {
		const width  = canvas.clientWidth;
		const height = canvas.clientHeight;
		const min = Math.min(width,height);
		canvas.width = min;
		canvas.height = min;
		gl.viewport(0, 0, canvas.width, canvas.height);
	}

	
	
}

document.addEventListener('DOMContentLoaded', main);



const particle_update_vert = `
#version 300 es
precision mediump float;

uniform bool	u_kill;
uniform vec2	u_origin;
uniform float	u_timeDelta;
uniform float	u_totalTime;
uniform float	u_thetaMean;
uniform float	u_thetaRange;
uniform float	u_lifespanMean;
uniform float	u_lifespanRange;
uniform float	u_radiusMean;
uniform float	u_radiusRange;
uniform float	u_friction;


in vec2 i_Position;
in float i_Age;
in float i_Life;
in vec2 i_Velocity;

out vec2 v_Position;
out float v_Age;
out float v_Life;
out vec2 v_Velocity;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
	if (u_kill) {
		v_Age = i_Life;
		v_Position = vec2(100.0,100.0);
	}
	else if (i_Age >= i_Life) {
		float rand1 = rand(vec2(u_totalTime, gl_VertexID));
		float rand2 = rand(vec2(rand1, gl_VertexID));
		float rand3 = rand(vec2(rand2, rand1));
		float theta = float(gl_VertexID) * u_thetaMean + u_thetaRange * (rand1-0.5); 
		float x = cos(theta);
		float y = sin(theta);
		v_Position = u_origin + vec2(x, y) * (u_radiusMean + u_radiusRange * (rand2-0.5));
		v_Age = 0.0;
		v_Life = u_lifespanMean + u_lifespanRange * (rand3-0.5);
		v_Velocity =
			vec2(0.0, 0.0);
	} else {
		v_Position = i_Position + i_Velocity * 0.01;
		v_Age = i_Age + u_timeDelta;
		v_Life = i_Life;
		vec2 dir = u_origin - i_Position;
		float dist = length(dir);
		float invDist;
		if (dist == 0.0) {
			invDist = 1000000000.0;
		} else {
			invDist = 1.0/dist;
		}
		v_Velocity = i_Velocity * u_friction + 0.02 * dir.yx * invDist * vec2(1.0,-1.0) * cos(3.14159265 * (dist - i_Age * 0.01  + 0.5) * 1.0) + 0.1 * dir * min(pow(dist,1.0),100.0);
	}

}
`
const passthru_frag_shader = `
#version 300 es
precision mediump float;
in float v_Age;
void main() { discard; }
`
const particle_render_vert = `
#version 300 es
precision mediump float;

uniform float u_startSize;
uniform float u_endSize;

in vec2 i_Position;
in float i_Age;
in float i_Life;
in vec2 i_Coord;
in vec2 i_TexCoord;

out float v_Age;
out float v_Life;
out vec2 v_TexCoord;

void main() {
	vec2 vert_coord = i_Position + mix(u_startSize,u_endSize,i_Age / i_Life)* 0.08 * i_Coord;
	v_Age = i_Age;
	v_Life = i_Life;
	v_TexCoord = i_TexCoord;
	gl_Position = vec4(vert_coord, 0.0, 1.0);
}
`
const particle_render_frag = `
#version 300 es
precision mediump float;

uniform sampler2D u_Sprite;
uniform vec3 u_base;
uniform float u_transparency;

in float v_Age;
in float v_Life;
in vec2 v_TexCoord;

out vec4 o_FragColor;

/* From http://iquilezles.org/www/articles/palettes/palettes.htm */
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{  return a + b*cos( 6.28318*(c*t+d) ); }

void main() {
	float t =  v_Age/v_Life + 0.5;
	vec3 color = palette(t, u_base, vec3(0.5,0.3,0.5), vec3(1.2,1.0,1.0), vec3(-0.16,0.16,0.4));
	o_FragColor = vec4(color, u_transparency) * (texture(u_Sprite, v_TexCoord));
}
`


const canvas = document.getElementsByTagName('canvas')[0];
// startRecording();

function startRecording() {
	const chunks = []; // here we will store our recorded media chunks (Blobs)
	const stream = canvas.captureStream(); // grab our canvas MediaStream
	const rec = new MediaRecorder(stream,{videoBitsPerSecond:7500000}); // init the recorder
	// every time the recorder has new data, we will store it in our array
	rec.ondataavailable = e => chunks.push(e.data);
	// only when the recorder stops, we construct a complete Blob from all the chunks
	rec.onstop = e => exportVid(new Blob(chunks, {type: 'video/webm'}));
	
	rec.start();
	setTimeout(()=>rec.stop(), 100000); // stop recording in 10s
}

function exportVid(blob) {
	const vid = document.createElement('video');
	vid.src = URL.createObjectURL(blob);
	vid.controls = true;
	document.body.appendChild(vid);
	const a = document.createElement('a');
	a.download = 'myvid.webm';
	a.href = vid.src;
	a.textContent = 'download the video';
	document.body.appendChild(a);
}






function init2() {
	const KillButton = new Controls.Button({name:"kill",displayName:"Reset all particles"});
	const Generation = new Controls.CollapsibleControlSet({name:"Generation"},
		[
			new Controls.CollapsibleControlSet({name:'Position'},
				[
				new Controls.RadioControlSet({},
					[
					new Controls.ControlSet({name:'Cartesian'},
						[
						// new Controls.MaxMinSlider({name:'x',min:-1,max:1,value:[-0.5,0.5],step:0.1,split:1,	tickInterval:0.1}),
						// new Controls.MaxMinSlider({name:'y',min:-1,max:1,value:[-0.5,0.5],step:0.1,split:1,	tickInterval:0.1})
						]),
					new Controls.ControlSet({name:'Radial'},
						[
						new Controls.Slider({name:'radiusMean',	displayName:'Radius Mean'	,min:0,	max:1.5,value:1.5,	step:0.1,	tickInterval:0.2,	title:'Average distance between newly spawned particle and the origin.'}),
						new Controls.Slider({name:'radiusRange',displayName:'Radius Range'	,min:0,	max:1,	value:0,	step:0.1,	tickInterval:0.1}),
						new Controls.Slider({name:'thetaMean',	displayName:'θ Mean'		,min:0,	max:180,value:84.6,	step:1,	tickInterval:45,	title:'Average angle between each newly spawned particle in degrees.'}),
						// new Controls.Checkbox({name:'thetaDir', displayName:'direction', value:true}),
						new Controls.Slider({name:'thetaRange',	displayName:'θ Range'		,min:0,	max:90,	value:0,	step:1,	tickInterval:22.5})
						])
					],'Radial')
				]),
			new Controls.CollapsibleControlSet({name:"Lifespan"},
				[
				new Controls.Slider({name:'lifespanMean',	displayName:'Lifespan (frames)',min:0,	max:/*BufferSize*/1000,	value:1000,	step:20,tickInterval:100,	title:'Average number of frames the particles will live for.'}),
				new Controls.Slider({name:'lifespanRange',	displayName:'Lifespan Range'	,min:0,	max:/*BufferSize*/100,	value:0,	step:1,	tickInterval:10}),
				]),
			new Controls.Slider({name:'spawnRate',		displayName:'Genesis Rate'	,min:0,	max:/*BufferSize/200*/5,	value:4,	step:0.1,	tickInterval:1,	title:'Rate at which particles are initaly generated.\nChanges have no affect once all particles are spawned in.'}),
		]);
	const Dynamics = new Controls.CollapsibleControlSet({name:"Dynamics"},
		[
		new Controls.Slider({name:'friction',		displayName:'Friction'	,min:0,	max:10,	value:1,	step:0.1,	tickInterval:1,	title:'Percentage of current velocity lost each frame'}),
		]);
	const Appearence = new Controls.CollapsibleControlSet({name:"Appearence"},
		[
		new Controls.CollapsibleControlSet({name:"Colours"},//Make a Pallete preview
			[
			new Controls.Slider({name:'transparency',	displayName:"Transparency",min:0,	max:1,	value:0.2,	step:0.05,	tickInterval:0.2}),
			new Controls.Colour({name:"base", 			displayName:"Base Colour", value:"#A01060",title:'The average colour of the particles.\nNote, the particles are never actually this colour.'})
			]),
		new Controls.CollapsibleControlSet({name:"Size"},
			[
			new Controls.Slider({name:'startSize',	displayName:"Starting Size",min:0,	max:2,	value:1,	step:0.1,	tickInterval:0.4}),
			new Controls.Slider({name:'endSize',	displayName:"Ending Size",	min:0,	max:2,	value:0.3,	step:0.1,	tickInterval:0.4}),
			])
		]);
	const top = new Controls.ControlSet({},[KillButton,Generation,Dynamics,Appearence]);
	document.querySelector('.super').append(top.elem);
	top.elem.dispatchEvent(new CustomEvent('attach'));
	return top;
}


function colourToVec(hex) {
	return hex.match(/[^#]{2}/g).map(f=>parseInt(f,16)/256);
}


function init3() {
	return document.querySelector('control-set');
}