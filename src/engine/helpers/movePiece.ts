import Chess = require("node-chess");
import deepCopy = require("./deepCopy");
export = movePiece;

function movePiece(move: Chess.Move, boardState?: Chess.BoardState): Chess.BoardState {
	var self: Chess.Engine = this;
	
	var from = move.from;
	var to = move.to;
	
	// TODO: Replace with better method
	// If no boardState is provided, the result of this function is stored as the calling engine's new board state 
	var saveToBoard = !boardState;
	boardState = deepCopy(boardState || self.boardState);

	var origin: Chess.Square = self.getSquare(from, boardState);
	if (!origin || !origin.piece) return null;			
	
	// Enforce turn-based movement
	if (boardState.whitesTurn !== origin.piece.isWhite) return null; 
		
	// The 'destination' square must be in the square's list of available moves
	var move = boardState.moves.filter(m =>
		m.from.file === from.file && m.from.rank === from.rank &&
		m.to.file === to.file && m.to.rank === to.rank)[0];
	if (!move) return null;

	var destination: Chess.Square = self.getSquare(to, boardState);
	if (destination.piece) boardState.capturedPieces.push(destination.piece)

	destination.piece = origin.piece;
	destination.piece.location = { file: to.file, rank: to.rank };
	boardState.moveHistory.push({ from: from, to: to, piece: destination.piece });

	var movePatternPostActions = move.postMoveActions || [];
	movePatternPostActions.forEach(func => {
		func.action(destination.piece, boardState, self);
	});

	var pieceFunctions = destination.piece.postMoveFunctions || [];
	pieceFunctions.forEach(fn => fn.action(destination.piece, boardState, self));

	origin.piece = null;

	boardState.whitesTurn = !boardState.whitesTurn;
	self.populateAvailableMoves(boardState);

	var enginePostMoveActions: Chess.MoveFunction[] = boardState.postMoveFunctions || [];

	enginePostMoveActions.forEach(postMove => {
		if (!postMove.moveNumber || postMove.moveNumber === boardState.moveNumber)
			postMove.action(destination.piece, boardState, self);
	});

	boardState.moveNumber++;
	boardState.postMoveFunctions = enginePostMoveActions.filter(pmf => !pmf.moveNumber || pmf.moveNumber >= boardState.moveNumber);

	// We only call post move functions if we're saving state
	if (!saveToBoard) return boardState;
	
	self.postMoveFunctions.forEach(moveFn => {
		moveFn.action(destination.piece, boardState, self);
	});
	self.boardState = boardState;
	return boardState;
}