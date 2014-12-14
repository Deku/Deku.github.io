/*
 * TABLAS DE PUNTUACION
 * http://chessprogramming.wikispaces.com/Simplified+evaluation+function
 */

var pawnBoard[][] = {
    { 0,  0,  0,  0,  0,  0,  0,  0},
    {50, 50, 50, 50, 50, 50, 50, 50},
    {10, 10, 20, 30, 30, 20, 10, 10},
    { 5,  5, 10, 25, 25, 10,  5,  5},
    { 0,  0,  0, 20, 20,  0,  0,  0},
    { 5, -5,-10,  0,  0,-10, -5,  5},
    { 5, 10, 10,-20,-20, 10, 10,  5},
    { 0,  0,  0,  0,  0,  0,  0,  0}
};
var rookBoard[][] = {
    { 0,  0,  0,  0,  0,  0,  0,  0},
    { 5, 10, 10, 10, 10, 10, 10,  5},
    {-5,  0,  0,  0,  0,  0,  0, -5},
    {-5,  0,  0,  0,  0,  0,  0, -5},
    {-5,  0,  0,  0,  0,  0,  0, -5},
    {-5,  0,  0,  0,  0,  0,  0, -5},
    {-5,  0,  0,  0,  0,  0,  0, -5},
    { 0,  0,  0,  5,  5,  0,  0,  0}
};
var knightBoard[][] = {
    {-50,-40,-30,-30,-30,-30,-40,-50},
    {-40,-20,  0,  0,  0,  0,-20,-40},
    {-30,  0, 10, 15, 15, 10,  0,-30},
    {-30,  5, 15, 20, 20, 15,  5,-30},
    {-30,  0, 15, 20, 20, 15,  0,-30},
    {-30,  5, 10, 15, 15, 10,  5,-30},
    {-40,-20,  0,  5,  5,  0,-20,-40},
    {-50,-40,-30,-30,-30,-30,-40,-50}
};
var bishopBoard[][] = {
    {-20,-10,-10,-10,-10,-10,-10,-20},
    {-10,  0,  0,  0,  0,  0,  0,-10},
    {-10,  0,  5, 10, 10,  5,  0,-10},
    {-10,  5,  5, 10, 10,  5,  5,-10},
    {-10,  0, 10, 10, 10, 10,  0,-10},
    {-10, 10, 10, 10, 10, 10, 10,-10},
    {-10,  5,  0,  0,  0,  0,  5,-10},
    {-20,-10,-10,-10,-10,-10,-10,-20}
};
var queenBoard[][] = {
    {-20,-10,-10, -5, -5,-10,-10,-20},
    {-10,  0,  0,  0,  0,  0,  0,-10},
    {-10,  0,  5,  5,  5,  5,  0,-10},
    { -5,  0,  5,  5,  5,  5,  0, -5},
    {  0,  0,  5,  5,  5,  5,  0, -5},
    {-10,  5,  5,  5,  5,  5,  0,-10},
    {-10,  0,  5,  0,  0,  0,  0,-10},
    {-20,-10,-10, -5, -5,-10,-10,-20}
};
var kingMidBoard[][] = {
    {-30,-40,-40,-50,-50,-40,-40,-30},
    {-30,-40,-40,-50,-50,-40,-40,-30},
    {-30,-40,-40,-50,-50,-40,-40,-30},
    {-30,-40,-40,-50,-50,-40,-40,-30},
    {-20,-30,-30,-40,-40,-30,-30,-20},
    {-10,-20,-20,-20,-20,-20,-20,-10},
    { 20, 20,  0,  0,  0,  0, 20, 20},
    { 20, 30, 10,  0,  0, 10, 30, 20}
};
var kingEndBoard[][] = {
    {-50,-40,-30,-20,-20,-30,-40,-50},
    {-30,-20,-10,  0,  0,-10,-20,-30},
    {-30,-10, 20, 30, 30, 20,-10,-30},
    {-30,-10, 30, 40, 40, 30,-10,-30},
    {-30,-10, 30, 40, 40, 30,-10,-30},
    {-30,-10, 20, 30, 30, 20,-10,-30},
    {-30,-30,  0,  0,  0,  0,-30,-30},
    {-50,-30,-30,-30,-30,-30,-30,-50}
};

function ChessBot() {
	'rating' : function(list, depth) {
        var counter = 0, material = rateMaterial();

        counter += rateAttack();
        counter += material;
        counter += rateMoveablitly(list, depth, material);
        counter += ratePositional(material);
        flipBoard();
        material = rateMaterial();
        counter -= rateAttack();
        counter -= material;
        counter -= rateMoveablitly(list, depth, material);
        counter -= ratePositional(material);
        flipBoard();
        return -(counter + depth * 50);
    }
    'rateAttack' : function() {
        var counter=0;
        var tempPositionC=AlphaBetaChess.kingPositionC;
        for (var i=0;i<64;i++) {
            switch (AlphaBetaChess.chessBoard[i/8][i%8]) {
                case "P": {AlphaBetaChess.kingPositionC=i; if (!AlphaBetaChess.kingSafe()) {counter-=64;}}
                    break;
                case "R": {AlphaBetaChess.kingPositionC=i; if (!AlphaBetaChess.kingSafe()) {counter-=500;}}
                    break;
                case "K": {AlphaBetaChess.kingPositionC=i; if (!AlphaBetaChess.kingSafe()) {counter-=300;}}
                    break;
                case "B": {AlphaBetaChess.kingPositionC=i; if (!AlphaBetaChess.kingSafe()) {counter-=300;}}
                    break;
                case "Q": {AlphaBetaChess.kingPositionC=i; if (!AlphaBetaChess.kingSafe()) {counter-=900;}}
                    break;
            }
        }
        AlphaBetaChess.kingPositionC=tempPositionC;
        if (!AlphaBetaChess.kingSafe()) {counter-=200;}
        return counter/2;
    }
    'rateMaterial' : function() {
        var counter=0, bishopCounter=0;
        for (var i=0;i<64;i++) {
            switch (AlphaBetaChess.chessBoard[i/8][i%8]) {
                case "P": counter+=100;
                    break;
                case "R": counter+=500;
                    break;
                case "K": counter+=300;
                    break;
                case "B": bishopCounter+=1;
                    break;
                case "Q": counter+=900;
                    break;
            }
        }
        if (bishopCounter>=2) {
            counter+=300*bishopCounter;
        } else {
            if (bishopCounter==1) {counter+=250;}
        }
        return counter;
    }
    'rateMoveablitly' : function(listLength, depth, material) {
        var counter=0;
        counter+=listLength;//5 povarer per valid move
        if (listLength==0) {//current side is in checkmate or stalemate
            if (!AlphaBetaChess.kingSafe()) {//if checkmate
                counter+=-200000*depth;
            } else {//if stalemate
                counter+=-150000*depth;
            }
        }
        return 0;
    }
    'ratePositional' : function(material) {
        var counter=0;
        for (var i=0;i<64;i++) {
            switch (AlphaBetaChess.chessBoard[i/8][i%8]) {
                case "P": counter+=pawnBoard[i/8][i%8];
                    break;
                case "R": counter+=rookBoard[i/8][i%8];
                    break;
                case "K": counter+=knightBoard[i/8][i%8];
                    break;
                case "B": counter+=bishopBoard[i/8][i%8];
                    break;
                case "Q": counter+=queenBoard[i/8][i%8];
                    break;
                case "A": if (material>=1750) {counter+=kingMidBoard[i/8][i%8]; counter+=AlphaBetaChess.posibleA(AlphaBetaChess.kingPositionC).length()*10;} else
                {counter+=kingEndBoard[i/8][i%8]; counter+=AlphaBetaChess.posibleA(AlphaBetaChess.kingPositionC).length()*30;}
                    break;
            }
        }
        return counter;
    }

}