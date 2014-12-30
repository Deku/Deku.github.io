/**
* Función Prim
* @param g: Grafo del cual se obtendra el arbol recubridor minimo representado en forma de matriz de incidencias
*/
var L = 5;

function Prim(grafo) {
	
	var parent = new Array();
	var key = new Array();
	var mstSet = new Array();

	// Set default values for arrays
	for (var i = 0; i < L; i++) {
		key[i] = 999999; 
		mstSet[i] = false;
	}

	key[0] = 0;
	parent[0] = -1;

	for (var count = 0; count < L - 1; count++) {
		var u = this.minKey(key, mstSet);
		console.log("Step " + count + " the minkey is " + u);
		mstSet[u] = true;

		for (var v = 0; v < L; v++) {
			if (grafo[u][v] && mstSet[v] == false && grafo[u][v] < key[v]) {
				parent[v] = u;
				key[v] = grafo[u][v];
			}
		};
	};

	// Print the solved tree
	print(parent, L, grafo);
};


// Return the index of the min key
function minKey(key, mstSet) {
	var min = 999999;
	var min_index;

	for (var v = 0; v < L; v++) {
		console.log("Checking minkey: mstSet[" + v + "] = " + mstSet[v] + " key[" + v + "] = " + key[v]);
		// If the node is not yet added and 
		if (mstSet[v] == false && key[v] <= min) {
			min = key[v];
			min_index = v;
		}
	};

	return min_index;
}

// Print the solved tree
function print(parent, n, graph) {
	var result = "Edge             Weight<br>";
	for (var i = 1; i < L; i++) {
		result += parent[i] + " - " + i + "        " + graph[i][parent[i]]+ "<br>";
	};

	$('#result').append(result);
}