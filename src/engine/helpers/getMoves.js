var getPaths = require("./getPaths");
function getMoves(coordinate) {
    var stopwatch = Date.now();
    var self = this;
    var square = self.getSquare(coordinate);
    // No piece, no moves.
    var piece = square.piece;
    if (!piece)
        return [];
    var bounds = { file: this.fileCount, rank: this.rankCount };
    function isValidPath(path, move) {
        // TODO: Rules API would be used here
        var isWhite = !!piece.isWhite;
        var lastCoordinateIndex = path.length - 1;
        var lastCoordinate = path[lastCoordinateIndex];
        var lastSquare = self.getSquare(lastCoordinate);
        // Optimisations
        // Ensure all squares leading up to the destination are vacant
        if (!move.canJump) {
            var isPathVacant = path.slice(0, -1).every(function (coord) { return !self.getSquare(coord).piece; });
            if (!isPathVacant)
                return false;
        }
        // Destination occupied optimisations        
        if (!!lastSquare.piece) {
            // Can't land on your own piece
            if (!!isWhite === !!lastSquare.piece.isWhite)
                return false;
            // Must be able to capture if pieces are opposing colours
            if (!move.canCapture)
                return false;
        }
        else {
            if (!move.canMove)
                return false;
        }
        return true;
    }
    var pathings = [];
    var conditionalMoves = getConditionalMoves(piece);
    var movePatterns = piece.movement.concat(conditionalMoves);
    movePatterns.forEach(function (move) {
        var newPathings = pathings.concat(getPaths(coordinate, move, piece.isWhite, bounds));
        var validPathings = newPathings.filter(function (pathing) { return isValidPath(pathing, move); });
        pathings = pathings.concat(validPathings);
    });
    var moves = pathings.map(function (pathing) {
        return pathing[pathing.length - 1];
    });
    return moves;
}
function getConditionalMoves(piece) {
    if (!piece.conditionalMoves)
        return [];
    if (piece.conditionalMoves.length === 0)
        return [];
    var movePatterns = [];
    piece.conditionalMoves.forEach(function (condition) {
        var conditionalMoves = condition();
        if (!conditionalMoves)
            return;
        movePatterns = movePatterns.concat(conditionalMoves);
    });
    return movePatterns;
}
module.exports = getMoves;
//# sourceMappingURL=getMoves.js.map