export default function({displayName, name, min, max, init, step}, options, cb) { //return slider obj with setter methods
	var slider = document.createElement("input");
	slider.setAttribute('type', 'range');

	var sliderContainer = document.createElement('p');
	sliderContainer.classList.add('sliderContainer')
	var sliderName = document.createElement('label');
	var sliderValue = document.createElement('input');
	sliderValue.type = "number";
	sliderValue.step = "any";
	sliderContainer.appendChild(sliderName);
	sliderContainer.appendChild(slider);
	sliderContainer.appendChild(sliderValue);

	var attached;

	var state = {
		set min(x)		{
			slider.min	= state._min 	= x;
			sliderValidity();
			drawTicks();
		},
		set max(x)		{
			slider.max	= state._max	= x;
			sliderValidity();
			drawTicks();
		},
		set step(x)		{
			slider.step	= state._step	= x;
		},
		set displayName(x)		{
			state._displayName	= x;
			sliderName.innerHTML= `${x}:`;
			sliderName.htmlFor	= `${x}Input`;
			sliderValue.id		= `${x}Input`;
		},
		set value(x)	{
			const y = parseFloat(x);
			if(isNaN(y)) return;
			slider.value= state._value	= y;
			if(y!==parseFloat(sliderValue.value)) sliderValue.value = y;
			sliderValidity();
			if (cb&&attached) cb(state);
		},
	};
	Object.keys(state).forEach(key=>{
		Object.defineProperty(state, key, {
			get: ()=>state[`_${key}`]
		});
	})
	state.min			= min;
	state.max			= max;
	state.value			= init;
	state.step			= step;
	state.displayName	= displayName || name;
	state.name			= name;
	state.elem			= sliderContainer;

	{
		function update() {
			state.value = this.value
		}
		slider.addEventListener('input',update);
		sliderValue.addEventListener('input',update);
	}

	sliderContainer.addEventListener('attach',()=>{
		attached = true;
		drawTicks();
	});

	function sliderValidity() {
		if(state.value < state.min || state.value > state.max)
			slider.setCustomValidity('Out of range');
		else slider.setCustomValidity('');
	}

	function drawTicks() {
		if (!options?.tickInterval || !attached) return;
		sliderContainer.querySelectorAll('.sliderTick').forEach(f=>f.remove());
		const range = state.max - state.min
		if (!range) return;
		const freq = 1 / options.tickInterval;
		const start = freq * (Math.ceil(state.min) - state.min);
		const count = range * freq;
		const dist = (slider.clientWidth - 12) * count;
		for (var i = start; i <= count; i++) {
			const tick = document.createElement("div");
			tick.classList.add('sliderTick');
			tick.style.left = CSS.px(i * dist + slider.offsetLeft + 6);
			sliderContainer.appendChild(tick);
		}
	}


	return state;
}



class Slider ext