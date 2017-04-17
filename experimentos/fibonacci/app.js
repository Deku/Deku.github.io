"use strict";

var table = document.getElementById("fibonacci-table");
var resCache = [];
var noteCache = [];
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
    if (noteCache.length > 0) {
        var cell = noteCache.shift();
        var step = cell.innerHTML;
        cell.style.backgroundColor = "#dff0d8";
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
        var fila = document.createElement("tr");
        var celdaN = document.createElement("td");
        var celdaFib = document.createElement("td");
        var celdaDiv = document.createElement("td");
        var celdaMod = document.createElement("td");
        var valor = fibonacci(i);
        var modulo = valor % scaleLength;

        celdaN.appendChild(document.createTextNode("(" + i + ")"));
        celdaFib.appendChild(document.createTextNode(valor));
        celdaDiv.appendChild(document.createTextNode(scaleLength));
        celdaMod.appendChild(document.createTextNode(modulo));
        noteCache.push(celdaMod);

        fila.appendChild(celdaN);
        fila.appendChild(celdaFib);
        fila.appendChild(celdaDiv);
        fila.appendChild(celdaMod);

        table.appendChild(fila);
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
    noteCache = [];
    osc = undefined;
    taskId = undefined;
    document.getElementById("reproducir").innerHTML = "Reproducir";
}
