export function mean(...args) {
	let array = flatten(args).filter(f=>typeof f !== "undefined");
	if (!array.length) 
		return undefined;
	return array.reduce((a,b)=>a+b,0)/args.length;
}

export function sum(...args) {
	let array = flatten(args).filter(f=>typeof f !== "undefined");
	if (!array.length) 
		return undefined;
	return array.reduce((a,b)=>a+b,0);
}

export function flatten(array,lvl) {
	let ret = [];
	array.forEach(elem=>{
		if (typeof elem === "undefined")
			ret.push(elem);
		else if(elem.length)
			ret.push(...flatten(elem,lvl-1));
		else
			ret.push(elem);
	});
	return ret;
}