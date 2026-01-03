"use strict";
const betaPromise = import('./beta.js').then(module => module.default());
const plotlyPromise = import('https://cdn.jsdelivr.net/npm/plotly.js-dist-min/plotly.min.js');

const PDF_DENSITY = 2000;
const PDF_N = PDF_DENSITY + 1;
const PDF_STEP = 100 / PDF_DENSITY;

const successes = document.getElementById("successes");
const failures = document.getElementById("failures");
const estimation = document.getElementById("estimation");
const greater = document.getElementById("greater");
const lesser = document.getElementById("lesser");
const chart = document.getElementById("chart");

const xPoints = Array.from({length: PDF_N}, (_, i) => i * PDF_STEP);
const yPointsPromise = betaPromise.then(betaDist => new Float64Array(betaDist.wasmMemory.buffer, betaDist._pdfs_pointer(), PDF_N));

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
	Plotly.newPlot(chart, [{x: xPoints, y: yPoints, mode: 'lines', line: {shape: 'spline'}}]);
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
	let isInputActive = document.activeElement?.nodeName.toLowerCase() == 'input';
	
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

document.querySelectorAll('body > section:nth-of-type(2) > table').forEach(table => table.addEventListener('click', () => switchWeight(table)));

for (let param in localStorage) {
	if (localStorage.getItem(param) == 'bold')
		document.getElementById(param).style.fontWeight = 'bold';
}
