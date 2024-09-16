import { PIECE_TYPE, Square } from "../store/board";

export class Validator {
  public isSameColor(color: boolean, p: Square) {
    if (color) {
      return (
        p.pieceType == PIECE_TYPE.wBishop ||
        p.pieceType == PIECE_TYPE.wKing ||
        p.pieceType == PIECE_TYPE.wKnight ||
        p.pieceType == PIECE_TYPE.wPawn ||
        p.pieceType == PIECE_TYPE.wQueen ||
        p.pieceType == PIECE_TYPE.wRook
      );
    } else {
      return (
        p.pieceType == PIECE_TYPE.bBishop ||
        p.pieceType == PIECE_TYPE.bKing ||
        p.pieceType == PIECE_TYPE.bKnight ||
        p.pieceType == PIECE_TYPE.bPawn ||
        p.pieceType == PIECE_TYPE.bQueen ||
        p.pieceType == PIECE_TYPE.bRook
      );
    }
  }

  private isValidBishopMove(from: Square, to: Square, board: Square[][]) {
    if (from.x - to.x === from.y - to.y) {
      let inc = from.x < to.x ? 1 : -1;
      let x = from.x + inc;
      let y = from.y + inc;
      while (x != to.x) {
        if (board[x][y].pieceType != PIECE_TYPE.emptySquare) return false;
        x += inc;
        y += inc;
      }
      return true;
    }
    return false;
  }

  private isValidRookMove(from: Square, to: Square, board: Square[][]) {
    if (from.x == to.x) {
      let inc = from.y < to.y ? 1 : -1;
      for (let y = from.y + inc; y != to.y; y += inc) {
        if (board[from.x][y].pieceType != PIECE_TYPE.emptySquare) {
          return false;
        }
      }
      return true;
    } else if (from.y == to.y) {
      let inc = from.x < to.x ? 1 : -1;
      for (let x = from.x + inc; x != to.x; x += inc) {
        if (board[x][from.y].pieceType != PIECE_TYPE.emptySquare) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  private isValidQueenMove(from: Square, to: Square, board: Square[][]) {
    return (
      this.isValidBishopMove(from, to, board) ||
      this.isValidRookMove(from, to, board)
    );
  }

  private isValidKingMove(from: Square, to: Square, board: Square[][]) {
    return Math.abs(from.x - to.x) < 1 && Math.abs(from.y - to.y) < 1;
  }

  private isValidKnightMove(from: Square, to: Square, board: Square[][]) {
    if (Math.abs(from.x - to.x) == 2) {
      return Math.abs(from.y - to.y) == 1;
    } else if (Math.abs(from.x - to.x) == 1) {
      return Math.abs(from.y - to.y) == 2;
    }
    return false;
  }

  private isValidPawnMove(from: Square, to: Square, board: Square[][]) {
    if (to.pieceType == PIECE_TYPE.emptySquare) {
      if (
        from.y == to.y &&
        (from.x - to.x == 1 ||
          (from.x == 1 &&
            from.x - to.x == 2 &&
            board[from.x + 1][from.y].pieceType == PIECE_TYPE.emptySquare))
      ) {
        return true;
      }
    } else {
      if (Math.abs(from.y - to.y) == 1 && to.x - from.x == 1) {
        return true;
      }
    }
    return false;
  }

  public validateMove(
    from: Square,
    to: Square,
    color: boolean,
    board: Square[][]
  ) {
    if (color) {
      switch (from.pieceType) {
        case PIECE_TYPE.wBishop: {
          return this.isValidBishopMove(from, to, board);
        }
        case PIECE_TYPE.wRook: {
          return this.isValidRookMove(from, to, board);
        }
        case PIECE_TYPE.wQueen: {
          return this.isValidQueenMove(from, to, board);
        }
        case PIECE_TYPE.wPawn: {
          return this.isValidPawnMove(from, to, board);
        }
        case PIECE_TYPE.wKing: {
          return this.isValidKingMove(from, to, board);
        }
        case PIECE_TYPE.wKnight: {
          return this.isValidKnightMove(from, to, board);
        }
      }
    } else {
      switch (from.pieceType) {
        case PIECE_TYPE.bBishop: {
          return this.isValidBishopMove(from, to, board);
        }
        case PIECE_TYPE.bRook: {
          return this.isValidRookMove(from, to, board);
        }
        case PIECE_TYPE.bQueen: {
          return this.isValidQueenMove(from, to, board);
        }
        case PIECE_TYPE.bPawn: {
          return this.isValidPawnMove(from, to, board);
        }
        case PIECE_TYPE.bKing: {
          return this.isValidKingMove(from, to, board);
        }
        case PIECE_TYPE.bKnight: {
          return this.isValidKnightMove(from, to, board);
        }
      }
    }

    return false;
  }
}
