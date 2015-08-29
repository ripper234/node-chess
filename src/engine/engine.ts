import Chess = require("node-chess");
import toString = require("./helpers/toString");
import getMoves = require("./helpers/getMoves");
import inferMoves = require("./helpers/inferMoves");
import movePiece = require("./helpers/movePiece");
import fenParser = require("./parsers/fen")
import createSqaures = require("./helpers/createSquares");
import BasePiece = require("./basePiece");
import availableMoves = require("./helpers/availableMoves");
import getSquare = require("./helpers/getSquare");
import createPiece = require("./helpers/createPiece");
import Promise = require("bluebird");
export = Engine;

/**
 * Board: extensible board (TODO: more detail)
 */
class Engine implements Chess.Engine {
    constructor() { }

    rankCount: number = 8;
    fileCount: number = 8;
    postMoveFunctions: Chess.MoveFunction[] = [];

    boardState: Chess.BoardState = {
        ranks: [],
        tags: <Chess.BoardTag>{},
        capturedPieces: [],
        whitesTurn: true,
        moveNumber: 1,
        preMoveFunctions: [],
        postMoveFunctions: [],
        moves: [],
        moveHistory: []
    }

    pieces = [];
    positionParser = fenParser.bind(this);

    movePiece = movePiece.bind(this);
    movePieceAsync = (move: Chess.Move, boardState?: Chess.BoardState): Promise<Chess.BoardState> => {
        var promise = new Promise<Chess.BoardState>((resolve, reject) => {
            setImmediate(() => {
                var newState = this.movePiece(move, boardState);
                resolve(newState);
            });
        });
        
        return promise;
    }


    getSquare = getSquare.bind(this);
    getMoves = getMoves.bind(this);

    create = createSqaures.bind(this);
    inferMoves = inferMoves.bind(this);
    toString = toString.bind(this);
    pieceFactory = BasePiece;
    populateAvailableMoves = availableMoves.bind(this);
    createPiece = createPiece.bind(this);
}





