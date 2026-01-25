"use strict";
const wasmError = new Promise((_, reject) => {addEventListener('unhandledrejection', error => {
		if (error.reason instanceof WebAssembly.CompileError) reject(error.reason);
});});
const importModule = path => import(path).then(module => module.default());
const betaPromise = Promise.race([importModule('./beta.js'), wasmError]).catch(() => importModule('./beta-safe.js'));
const plotlyPromise = import('https://cdn.jsdelivr.net/npm/plotly.js-dist-min/plotly.min.js').then(async () => Plotly.newPlot(chart,
		[{dx: 100 / PDF_DENSITY, y: await yPointsPromise, line: {simplify: false}}],
		{xaxis: {range: [0, 100]}, yaxis: {rangemode: "tozero"}},
		{responsive: true}
));

const PDF_DENSITY = 10000;
const yPointsPromise = betaPromise.then(beta => new Float64Array(beta.wasmMemory.buffer, beta._pdfs_pointer(), PDF_DENSITY + 1));

const successes = document.getElementById("successes");
const failures = document.getElementById("failures");
const estimation = document.getElementById("estimation");
const greater = document.getElementById("greater");
const lesser = document.getElementById("lesser");
const chart = document.getElementById("chart");

if (localStorage.getItem("successes")) successes.value = localStorage.getItem("successes");
if (localStorage.getItem("failures")) failures.value = localStorage.getItem("failures");

function format(percentage) {
	return (percentage * 100).toFixed();
}

let lastUpdate = 0;

async function draw(updateId) {
	await plotlyPromise;
	const yPoints = await yPointsPromise;
	if (updateId != lastUpdate) return;
	Plotly.restyle(chart, {y: yPoints});
}

async function update() {
	localStorage.setItem("successes", successes.value);
	localStorage.setItem("failures", failures.value);
	
	const updateId = lastUpdate = (lastUpdate + 1) % Number.MAX_SAFE_INTEGER;
	const betaDist = await betaPromise;
	if (updateId != lastUpdate) return;
	
	const alpha = (successes.valueAsNumber || 0) + .5;
	const beta = (failures.valueAsNumber || 0) + .5;
	betaDist._set_params(alpha, beta);
	
	estimation.textContent = format(alpha / (alpha + beta));
	greater.textContent = format(betaDist._quantile(.05));
	lesser.textContent = format(betaDist._quantile(.95));
	
	draw(updateId);
}

document.querySelectorAll('input').forEach(input => input.addEventListener('input', update));
update();

document.addEventListener('keydown', function(event) {
	const isInputActive = document.activeElement?.nodeName.toLowerCase() == 'input';
	
	if (event.key == 'Enter') {
		if (isInputActive) document.activeElement.blur();
		else successes.select();
	}
	else if (event.key == 'ArrowUp' && !isInputActive) {
		successes.valueAsNumber = successes.valueAsNumber + 1;
		update();
	}
	else if (event.key == 'ArrowDown' && !isInputActive) {
		failures.valueAsNumber = failures.valueAsNumber + 1;
		update();
	}
});

function switchWeight(element) {
	element.style.fontWeight = element.style.fontWeight == 'bold' ? 'normal' : 'bold';
	localStorage.setItem(element.id, element.style.fontWeight);
}

document.querySelectorAll('table[id]').forEach(table => table.addEventListener('click', () => switchWeight(table)));

for (const param in localStorage) {
	if (localStorage.getItem(param) == 'bold')
		document.getElementById(param).style.fontWeight = 'bold';
}
