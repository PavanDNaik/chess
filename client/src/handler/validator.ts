import { PIECE_TYPE, Square } from "../store/board";

export class Validator {
  canCassleLeft: boolean;
  canCassleRight: boolean;
  constructor() {
    this.canCassleLeft = true;
    this.canCassleRight = true;
  }
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
    if (Math.abs(from.x - to.x) === Math.abs(from.y - to.y)) {
      let incx = from.x < to.x ? 1 : -1;
      let incy = from.y < to.y ? 1 : -1;
      let x = from.x + incx;
      let y = from.y + incy;
      while (x != to.x) {
        if (board[x][y].pieceType != PIECE_TYPE.emptySquare) return false;
        x += incx;
        y += incy;
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
    let diffx: number = Math.abs(from.x - to.x);
    let diffy: number = Math.abs(from.y - to.y);
    if (diffx == 1 && diffy == 1) return true;
    if (diffx == 1 && diffy == 0) return true;
    if (diffx == 0 && diffy == 1) return true;
    if (diffy == 0) {
      if (diffx == 2 && to.y > from.y && this.canCassleRight) {
        return this.isValidRookMove(from, to, board);
      } else if (diffx == 3 && to.y < from.y && this.canCassleLeft) {
        return this.isValidRookMove(from, to, board);
      }
    }
    return false;
  }

  private isValidKnightMove(from: Square, to: Square, board: Square[][]) {
    if (Math.abs(from.x - to.x) == 2) {
      return Math.abs(from.y - to.y) == 1;
    } else if (Math.abs(from.x - to.x) == 1) {
      return Math.abs(from.y - to.y) == 2;
    }
    return false;
  }

  private isValidPawnMove(
    from: Square,
    to: Square,
    board: Square[][],
    factor: 1 | -1
  ) {
    if (to.pieceType == PIECE_TYPE.emptySquare) {
      if (
        from.y == to.y &&
        (from.x - to.x == 1 * factor ||
          (from.x == (factor == -1 ? 1 : 6) &&
            from.x - to.x == 2 * factor &&
            board[from.x - 1][from.y].pieceType == PIECE_TYPE.emptySquare))
      ) {
        return true;
      }
    } else {
      if (Math.abs(from.y - to.y) == 1 && to.x - from.x == 1 * factor) {
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
          return this.isValidPawnMove(from, to, board, -1);
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
          if (this.isValidRookMove(from, to, board)) {
            if (from.y == 0 && from.x == 7) {
              this.canCassleLeft = false;
            } else if (from.y == 7 && from.x == 7) {
              this.canCassleRight = false;
            }
            return true;
          }
          return false;
        }
        case PIECE_TYPE.bQueen: {
          return this.isValidQueenMove(from, to, board);
        }
        case PIECE_TYPE.bPawn: {
          return this.isValidPawnMove(from, to, board, 1);
        }
        case PIECE_TYPE.bKing: {
          if (this.isValidKingMove(from, to, board)) {
            this.canCassleLeft = false;
            this.canCassleRight = false;
            return true;
          }
          return false;
        }
        case PIECE_TYPE.bKnight: {
          return this.isValidKnightMove(from, to, board);
        }
      }
    }

    return false;
  }
}
