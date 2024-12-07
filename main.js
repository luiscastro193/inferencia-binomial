"use strict";
import cephes from 'https://cdn.jsdelivr.net/npm/cephes/+esm';

const successes = document.getElementById("successes");
const failures = document.getElementById("failures");
const estimation = document.getElementById("estimation");
const greater = document.getElementById("greater");
const lesser = document.getElementById("lesser");
const chart = document.getElementById("chart");

let xPoints = new Array(501);
let yPoints = new Array(501);
let lastUpdate = 0;

if (localStorage.getItem("successes")) successes.value = localStorage.getItem("successes");
if (localStorage.getItem("failures")) failures.value = localStorage.getItem("failures");

for (let i = 0; i < 1001; i++)
	xPoints[i] = i * .1;

function pdf(alpha, beta, x) {
	return Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1);
}

function format(percentage) {
	return (percentage * 100).toFixed();
}

async function update() {
	const updateId = lastUpdate = (lastUpdate + 1) % Number.MAX_SAFE_INTEGER;
	await cephes.compiled;
	if (updateId != lastUpdate) return;
	
	const alpha = (successes.valueAsNumber || 0) + .5;
	const beta = (failures.valueAsNumber || 0) + .5;
	
	estimation.textContent = format(alpha / (alpha + beta));
	greater.textContent = format(cephes.incbi(alpha, beta, .05));
	lesser.textContent = format(cephes.incbi(alpha, beta, .95));
	
	for (let i = 0; i < 1001; i++)
		yPoints[i] = pdf(alpha, beta, i * .001);
	
	Plotly.newPlot(chart, [{x: xPoints, y: yPoints, mode: 'lines'}]);
	
	localStorage.setItem("successes", successes.value);
	localStorage.setItem("failures", failures.value);
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
