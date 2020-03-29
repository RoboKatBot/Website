// {name, min, max, init, step, split?} // Init = Number or [*lower*,*upper*]

// split = 2,1||0 2=> splitted, 1 => splittable 




// controlSet atomic with recursive functionality?


import {mean, sum} from '/mathUtilities.mjs'




class Control {
	constructor({name, displayName, title}) {
		const elem = document.createElement('div');
		elem.classList.add(this.constructor.name);
		displayName = displayName || name;
		title = title || displayName;
		if (title) elem.setAttribute('title',title);
		Object.assign(this, arguments[0], {elem, displayName, title});
	}
}


export class Button extends Control {
	constructor(params) {
		super(params);
		this.elem.innerHTML = this.displayName;

		this.elem.addEventListener('mousedown',()=>{
			this._value = 1;
			this.clicked = 1;
		});
		this.elem.addEventListener('mouseup',()=>{
			this.clicked = 0;
		});
	}
	get value() {
		if (this._value) 
			return this._value = this.clicked ? 1 : 0
		return 0
	}
}

export class Colour extends Control {
	constructor(params) {
		const label = document.createElement("label");
		const input = document.createElement("input");
		super({label, input, ...params});
		input.type = "color";
		this.elem.appendChild(label);
		label.appendChild(input);
	}
	get value() {
		return this.input.value;
	}
	set value(x) {
		this.input.value = x;
	}
	set displayName(x) {
		this.label.innerHTML = x;
	}
}

export class Slider extends Control {
	constructor(params, cb) {
		const label = document.createElement('label');
		const slider = document.createElement("input");
		const sliderValue = document.createElement('input');
		super({cb, slider, sliderValue, label, ...params});
		slider.setAttribute('type', 'range');
		sliderValue.type = "number";
		sliderValue.step = "any";
		this.elem.appendChild(label);
		this.elem.appendChild(slider);
		this.elem.appendChild(sliderValue);



		['min','max','step','displayName','value'].forEach(key=>{
			Object.defineProperty(this, key, {
				get: ()=>this[`_${key}`],
				set: this.__lookupSetter__(key)
			});
		});

		const update = e => {
			this.value = e.target.value;
		}
		slider.addEventListener('input',update);
		sliderValue.addEventListener('input',update);

		this.elem.addEventListener('attach',()=>{
			this.attached = true;
			this.drawTicks();
		});
	}
	set min(x)		{
		this.slider.min	= this._min 	= x;
		this.sliderValidity();
		this.drawTicks();
	}
	set max(x)		{
		this.slider.max	= this._max	= x;
		this.sliderValidity();
		this.drawTicks();
	}
	set step(x)		{
		this.slider.step	= this._step	= x;
	}
	set displayName(x)		{
		this._displayName	= x;
		this.label.innerHTML= `${x}:`;
		this.label.htmlFor	= `${x}Input`;
		this.sliderValue.id		= `${x}Input`;
	}
	set value(x)	{
		const y = parseFloat(x);
		if(isNaN(y)) return;
		this.slider.value= this._value	= y;
		if(y!==parseFloat(this.sliderValue.value) || this.sliderValue.value === "")
			this.sliderValue.value = y;
		this.sliderValidity();
		if (this.cb&&this.attached) this.cb(this);
	}
	sliderValidity() {
		if(this.value < this.min || this.value > this.max)
			this.slider.setCustomValidity('Out of range');
		else this.slider.setCustomValidity('');
	}
	drawTicks() {
		if (!this.tickInterval || !this.attached) return;
		this.elem.querySelectorAll('.SliderTick').forEach(f=>f.remove());
		const range = this.max - this.min
		if (!range) return;
		const freq = 1 / this.tickInterval;
		const start = freq * (Math.ceil(this.min) - this.min);
		const count = range * freq;
		const dist = (this.slider.clientWidth - 12) / count;
		for (var i = start; i <= count; i++) {
			const tick = document.createElement("div");
			tick.classList.add('SliderTick');
			tick.style.left = CSS.px(i * dist + this.slider.offsetLeft + 6);
			this.elem.appendChild(tick);
		}
	}
}

export class MaxMinSlider {
	constructor(paramaters) {
		const elem = document.createElement("div");
		const splitter = document.createElement("label");
		splitter.innerHTML = `Sync Max and Min ${paramaters.displayName} Values`
		const splitBox = document.createElement("input");
		splitBox.type = "checkbox";
		splitBox.checked = 1 - paramaters.split;
		splitter.appendChild(splitBox);
		elem.appendChild(splitter);
		splitBox.addEventListener('change',()=>{
			this.split = 1 - splitBox.checked;
			this.populate();
		});
		Object.assign(this,{elem, ...paramaters});
		this.populate();
		elem.addEventListener('attach',(e)=>{
			this.attached = true;
			this.sliders.forEach(attachedEvent)
		});
	}
	populate() {
		this?.sliders?.forEach(f=>f.elem.remove());
		this.sliders = [];
		if (!this.split) { 
			const args = {...this,value:mean(this.values)||this.init?.mid||this.init};
			this.sliders[0] = new Slider(args);
		}
		else {
			const args1 = {...this, displayName:`${this.displayName||this.name} - Min`, max:this.values?.[0]||this.init[1]||this.init, init:this.values?.[0]||this.init[0]||this.init};
			const args2 = {...this, displayName:`${this.displayName||this.name} - Max`, min:this.values?.[0]||this.init[0]||this.init, init:this.values?.[0]||this.init[1]||this.init};
			this.sliders = [
				new Slider(args1, ({value})=>{
					this.sliders[1].min = value;
				}),
				new Slider(args2, ({value})=>{
					this.sliders[0].max = value;
				})//`${this.name} - Min`, this.min, this.init?.mid || this.init, this.values?.[0]||this.init?.lower||this.init, this.step
			];//`${this.name} - Max`, this.init?.mid || this.init, this.max, this.values?.[1]||this.init?.upper||this.init, this.step
		}
		this.elem.prepend(...this.sliders.map(f=>f.elem));
		if(this.attached) {
			this.sliders.forEach(attachedEvent);
			modifiedEvent(this.elem);
		}
	}
	get value() {
		if (!this.split)	
			return [this.sliders[0].value,this.sliders[0].value];
		return [this.sliders[0].value,this.sliders[1].value];
	}
}

export class ControlSet extends Control {
	constructor(params, controls) { //[...Control||ControlSet]
		super(params);
		this.elem.classList.add("ControlSet");
		this.elem.append(...controls.map(f=>f.elem));
		this.elem.addEventListener('attach', (e)=>{
			this.attached = true;
			controls.forEach(attachedEvent)
		});
		this.controls = controls;
	}
	getValue() {
		const ret = {};
		this.controls.forEach(f=>{
			if (f.name) 
				ret[f.name] = f.getValue?.()||f.value;
			else
				Object.assign(ret, f.getValue?.()||f.value);
		});
		return ret;
	}
	get height() {
		return this.controls.reduce((a,b)=>a+getHeight(b),0);
	}
}


export class CollapsibleControlSet extends ControlSet {
	constructor({displayName, name}, controls, init) { // [...Control||ControlSet]
		super({name}, controls);

		const downArrow = document.createElementNS(svgNS, "use");
		const svg = document.createElementNS(svgNS, "svg");
		const collapseButton = document.createElement("h3");

		downArrow.setAttributeNS(xlinkNS, "href", "#downArrow");
		svg.classList.add('downArrow');
		svg.append(downArrow);
		collapseButton.innerHTML = displayName || name;
		collapseButton.classList.add('collapseButton');
		collapseButton.append(svg);
		this.elem.prepend(collapseButton);

		const resize = (toggle) => {
			if (toggle===1)
				collapseButton.classList.toggle("hidden");
			if(collapseButton.classList.contains("hidden") ^ !toggle===1) {
				this.elem.style.height = CSS.px(collapseButton.scrollHeight);
			}
			else {
				this.elem.style.height = CSS.px(this.height);
			}
			modifiedEvent(this.elem.parentElement);
		}

		collapseButton.addEventListener('click',resize.bind(this,1));
		this.elem.addEventListener('attach',resize,{once:1});
		this.elem.addEventListener('modification',resize);
	}
	get height() {
		return getHeight(this.elem.firstElementChild) +
			(this.elem.firstElementChild.classList.contains("hidden") ? 0 :super.height);
	}
}

export class RadioControlSet extends ControlSet {//Radio controls to choose a control set 
	constructor({name, displayName}, controls, init) { // [...[Control||ControlSet]], default 
		super({name}, controls);
		this.selected = init;
		const radioContainer = document.createElement('div');
		this.elem.prepend(radioContainer);
		controls.forEach((control)=>{
			const label = document.createElement('label');
			label.innerHTML = control.displayName || control.name;
			radioContainer.append(label);
			const radio = document.createElement('input');
			radio.type = "radio";
			radio.name = name; /////////////////////////////////////////////////////////////////////////////////////////////////
			radio.id = control.name;
			if(control.name===init)
				radio.checked = true;
			else
				control.elem.style.display = 'none';
			label.append(radio);
			radio.addEventListener('input',(e)=>{
				this.selected = control.name;
				controls.forEach((c)=>{
					if(c.name===control.name) c.elem.style.display = '';
					else c.elem.style.display = 'none';
				});
				modifiedEvent(this.elem);
			});
		});
	}
	getValue() {
		return {selected:this.selected,...super.getValue()};
	}
	get height() {
		const con = this.controls.filter(f=>f.name===this.selected)[0];
		return (con.height || getHeight(con.elem)) + getHeight(this.elem.firstElementChild);
	}
}




const svgNS = "http://www.w3.org/2000/svg";
const xlinkNS = "http://www.w3.org/1999/xlink";




function attachedEvent(control) {
	control.elem.dispatchEvent(new CustomEvent('attach'));
}

function modifiedEvent(elem) {
	elem?.dispatchEvent(new CustomEvent('modification', {bubbles:true}))
}

function getHeight(arg) { //control || elem
	const elem = arg.elem || arg;
	const style = getComputedStyle(elem);
	const extra = sum(["marginTop","marginBottom","paddingTop","paddingBottom","borderTopWidth","borderBottomWidth"].map(f=>parseInt(style[f].replace('px',''))))
	return (arg.height || elem.scrollHeight) + extra;
}