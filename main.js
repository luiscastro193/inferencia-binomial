"use strict";
import betaDist from 'https://cdn.jsdelivr.net/npm/@stdlib/stats-base-dists-beta/+esm';

const successes = document.getElementById("successes");
const failures = document.getElementById("failures");
const estimation = document.getElementById("estimation");
const greater = document.getElementById("greater");
const lesser = document.getElementById("lesser");
const chart = document.getElementById("chart");

let xPoints = new Array(501);
let yPoints = new Array(501);

if (localStorage.getItem("successes")) successes.value = localStorage.getItem("successes");
if (localStorage.getItem("failures")) failures.value = localStorage.getItem("failures");

for (let i = 0; i < 501; i++)
	xPoints[i] = i * .2;

function update() {
	let alpha = Number(successes.value) + .5;
	let beta = Number(failures.value) + .5;
	
	estimation.textContent = (betaDist.mean(alpha, beta) * 100).toFixed();
	greater.textContent = (betaDist.quantile(.05, alpha, beta) * 100).toFixed();
	lesser.textContent = (betaDist.quantile(.95, alpha, beta) * 100).toFixed();
	
	for (let i = 0; i < 501; i++)
		yPoints[i] = betaDist.pdf(i * .002, alpha, beta);
	
	Plotly.newPlot(chart, [{x: xPoints, y: yPoints, mode: 'lines'}], {xaxis: {range: [0, 100]}});
	
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
		successes.value = Number(successes.value) + 1;
		update();
	}
	else if (event.key == 'ArrowDown' && !isInputActive) {
		failures.value = Number(failures.value) + 1;
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
