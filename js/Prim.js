/**
* Función Prim
* @param g: Grafo del cual se obtendra el arbol recubridor minimo representado en forma de matriz de incidencias
*/
var L = 5;

function Prim(/*grafo*/ g) {
	
	var parent = new Array();
	var key = new Array();
	var mstSet = new Array();

	for (var i = 0; i < L; i++) {
		key[i] = 999999; 
		mstSet[i] = false;
	}

	key[0] = 0;
	parent[0] = -1;

	for (var count = 0; count < L - 1; count++) {
		var u = this.minKey(key, mstSet);
		mstSet[u] = true;

		for (var v = 0; v < L; v++) {
			if (g[u][v] && mstSet[v] == false && g[u][v] < key[v]) {
				parent[v] = u;
				key[v] = g[u][v];
			}
		};
	};

	print(parent, L, g);
};

function minKey(key, mstSet) {
	var min = 999999;
	var min_index;

	for (var v = 0; v < L; v++) {
		if (mstSet[v] == false && key[v] <= min) {
			min = key[v];
			min_index = v;
		}
	};

	return min_index;
}

function print(parent, n, graph) {
	var result = "Edge             Weight<br>";
	for (var i = 1; i < L; i++) {
		result += parent[i] + " - " + i + "        " + graph[i][parent[i]]+ "<br>";
	};

	$('#result').append(result);
}