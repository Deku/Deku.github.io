function Grafo(/*array*/ n, /*array*/ a) {
	var nodos;
	var aristas;

	this.nodos = n;
	this.aristas = a;
}

Grafo.prototype.getNodo = function(i) {
	return nodos[i];
};

Grafo.prototype.getArista = function(i) {
	return aristas[i];
};