"use strict";
const betaDistPromise = import('https://cdn.jsdelivr.net/npm/@stdlib/stats-base-dists-beta/+esm').then(module => module.default);
const plotlyPromise = import('https://cdn.jsdelivr.net/npm/plotly.js-dist-min/plotly.min.js');

const successes = document.getElementById("successes");
const failures = document.getElementById("failures");
const estimation = document.getElementById("estimation");
const greater = document.getElementById("greater");
const lesser = document.getElementById("lesser");
const chart = document.getElementById("chart");

let xPoints = new Array(1001);
let yPoints = new Array(1001);
let lastUpdate = 0;

if (localStorage.getItem("successes")) successes.value = localStorage.getItem("successes");
if (localStorage.getItem("failures")) failures.value = localStorage.getItem("failures");

for (let i = 0; i < 1001; i++)
	xPoints[i] = i * .1;

function format(percentage) {
	return (percentage * 100).toFixed();
}

async function draw(pdf, updateId) {
	await plotlyPromise;
	if (updateId != lastUpdate) return;
	
	for (let i = 0; i < 1001; i++)
		yPoints[i] = pdf(i * .001);
	
	Plotly.newPlot(chart, [{x: xPoints, y: yPoints, mode: 'lines', line: {shape: 'spline'}}]);
}

async function update() {
	localStorage.setItem("successes", successes.value);
	localStorage.setItem("failures", failures.value);
	
	const updateId = lastUpdate = (lastUpdate + 1) % Number.MAX_SAFE_INTEGER;
	const betaDist = await betaDistPromise;
	if (updateId != lastUpdate) return;
	
	const alpha = (successes.valueAsNumber || 0) + .5;
	const beta = (failures.valueAsNumber || 0) + .5;
	const quantile = betaDist.quantile.factory(alpha, beta);
	const pdf = betaDist.pdf.factory(alpha, beta);
	
	estimation.textContent = format(alpha / (alpha + beta));
	greater.textContent = format(quantile(.05));
	lesser.textContent = format(quantile(.95));
	
	draw(pdf, updateId);
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
