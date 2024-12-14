import { PIECE_TYPE, Square } from "../store/board";
import { PAWN_MOVES } from "../store/type";

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

  private isSafeForKing(square: Square, color: boolean) {}

  private isValidKingMove(
    from: Square,
    to: Square,
    board: Square[][],
    color: boolean
  ) {
    if (this.isSameColor(color, to)) {
      return false;
    }

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
    // jump of 2+1 or 1+2
    if (Math.abs(from.x - to.x) == 2) {
      return Math.abs(from.y - to.y) == 1;
    } else if (Math.abs(from.x - to.x) == 1) {
      return Math.abs(from.y - to.y) == 2;
    }
    return false;
  }

  private isValidPawnMove(from: Square, to: Square, board: Square[][]) {
    if (
      from.pieceType != PIECE_TYPE.wPawn &&
      from.pieceType != PIECE_TYPE.bPawn
    )
      return false;

    let xDiff = from.x - to.x;
    let yDiff = from.y - to.y;
    let currentColor = false;
    let rowForTwoJump = 6;
    if (from.pieceType == PIECE_TYPE.wPawn) {
      xDiff = to.x - from.x;
      yDiff = to.y - from.y;
      currentColor = true;
      rowForTwoJump = 1;
    }

    if (xDiff == 2 && yDiff == 0) {
      // to make a move of two, target should be empty and row should be 6b / 1w
      if (from.x == rowForTwoJump && to.pieceType == PIECE_TYPE.emptySquare) {
        return true;
      }
    } else if (xDiff == 1 && yDiff == 0) {
      // move of 1 target empty
      if (to.pieceType == PIECE_TYPE.emptySquare) {
        return true;
      }
    } else if (xDiff == 1 && (yDiff == 1 || yDiff == -1)) {
      // for capture target piece should be of opponent
      if (!this.isSameColor(currentColor, to)) {
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
          return this.isValidKingMove(from, to, board, true);
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
          return this.isValidPawnMove(from, to, board);
        }
        case PIECE_TYPE.bKing: {
          if (this.isValidKingMove(from, to, board, false)) {
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
