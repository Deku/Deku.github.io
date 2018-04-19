"use strict";

var table = document.getElementById("fibonacci-table");
var resCache = [];
var rowList = [];
var taskId;
var tune = new Tune();
/* WEB AUDIO SETUP */
var osc;
var actx = new (AudioContext || wedkitAudioContext)();
var vol = actx.createGain();
var echo = actx.createDelay();
echo.delayTime.value = 0.3;
vol.gain.value = 0.5;
echo.connect(vol);

var changeNote = function() {
    if (rowList.length > 0) {
        var row = rowList.shift();
        var step = row.cells[3].innerText;
        row.style.backgroundColor = "rgba(0,0,0,0.1)";
        var newFreq = tune.note(step);
        osc.frequency.setValueAtTime(newFreq, actx.currentTime);
    } else {
        stopPlaying();
    }
}

function fibonacci(n) {
    if (resCache[n] == null) {
        resCache[n] = n == 0 ? n : n < 3 ? 1 : (fibonacci(n-1) + fibonacci(n-2));
    }
    return resCache[n];
}

function play() {
    if (taskId != null) {
        stopPlaying();
        return;
    }

    var inputCantidad = document.getElementById("cant_numeros");
    var limit = parseInt(inputCantidad.value);
    if (isNaN(limit) || !inputCantidad.checkValidity()) {
        alert("Número ingresado no es válido.");
        return;
    }

    var scale = document.getElementById("escala").value;
    tune.loadScale(scale);
    var scaleLength = tune.scale.length;

    // empty table
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // fill table
    for (var i = 0; i <= limit; i++) {
        var row = document.createElement("tr");
        var cellN = document.createElement("td");
        var cellFib = document.createElement("td");
        var cellDiv = document.createElement("td");
        var cellMod = document.createElement("td");
        var valor = fibonacci(i);
        var modulo = valor % scaleLength;

        cellN.appendChild(document.createTextNode("(" + i + ")"));
        cellFib.appendChild(document.createTextNode(valor));
        cellDiv.appendChild(document.createTextNode(scaleLength));
        cellMod.appendChild(document.createTextNode(modulo));
        
        row.appendChild(cellN);
        row.appendChild(cellFib);
        row.appendChild(cellDiv);
        row.appendChild(cellMod);

        rowList.push(row);

        table.appendChild(row);
    }

    // start playing notes
    osc = actx.createOscillator();
    osc.type = "sine";
    osc.connect(vol).connect(echo).connect(actx.destination);
    osc.start();
    changeNote();
    taskId = setInterval(changeNote, 200);
    document.getElementById("reproducir").innerHTML = "Detener";
}

function stopPlaying() {
    osc.stop();
    clearInterval(taskId);
    rowList = [];
    osc = undefined;
    taskId = undefined;
    document.getElementById("reproducir").innerHTML = "Reproducir";
}
