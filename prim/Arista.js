function Arista(n1, n2, p) {
	var nodo1;
	var nodo2;
	var peso;

	this.nodo1 = n1;
	this.nodo2 = n2;
	this.peso = p;
};

Arista.prototype.isRelated = function (nodo) {
	return this.nodo1 == nodo || this.nodo2 == nodo;
}