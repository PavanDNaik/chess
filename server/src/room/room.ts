import { Pair, User } from "../user/user";
import { PIECE_TYPE, Square } from "./board";

export interface RoomType {
  id: number;
  players: Pair;
  isWaiting: boolean; // only 1 player is present
  turn: boolean; // black or white
  board: Square[][];
}

export class Room implements RoomType {
  id: number;
  players: Pair;
  isWaiting: boolean;
  turn: boolean;
  board: Square[][];

  constructor(user: User, id: number, Color: boolean) {
    this.id = id;
    this.players = this.getPiar(user, Color);
    this.isWaiting = true;
    this.turn = true;
    this.board = this.prepareBoard();
  }

  private getPiar(User: User, Color: boolean): Pair {
    if (Color) {
      return {
        isReady: false,
        White: User,
      };
    } else {
      return {
        isReady: false,
        Black: User,
      };
    }
  }

  private prepareBoard() {
    let board: Square[][] = [];
    let Toggle: boolean = false;
    for (let i = 0; i < 8; i++) {
      let row: Square[] = [];

      for (let j = 0; j < 8; j++) {
        row.push({
          x: i,
          y: j,
          color: Toggle,
          pieceType: PIECE_TYPE.emptySquare,
        });
      }
    }

    this.getInitPieceype(board);
    return board;
  }

  private getInitPieceype(board: Square[][]) {
    for (let j = 0; j < 8; j++) {
      board[1][j].pieceType = PIECE_TYPE.wPawn;
      board[6][j].pieceType = PIECE_TYPE.bPawn;
    }

    board[0][0].pieceType = PIECE_TYPE.wRook;
    board[0][7].pieceType = PIECE_TYPE.wRook;

    board[7][0].pieceType = PIECE_TYPE.bRook;
    board[7][7].pieceType = PIECE_TYPE.bRook;

    board[0][1].pieceType = PIECE_TYPE.wKnight;
    board[0][6].pieceType = PIECE_TYPE.wKnight;

    board[7][1].pieceType = PIECE_TYPE.bKnight;
    board[7][6].pieceType = PIECE_TYPE.bKnight;

    board[0][2].pieceType = PIECE_TYPE.wBishop;
    board[0][5].pieceType = PIECE_TYPE.wBishop;

    board[7][2].pieceType = PIECE_TYPE.bBishop;
    board[7][5].pieceType = PIECE_TYPE.bBishop;

    board[0][3].pieceType = PIECE_TYPE.wQueen;
    board[0][4].pieceType = PIECE_TYPE.wKing;

    board[7][3].pieceType = PIECE_TYPE.bQueen;
    board[7][4].pieceType = PIECE_TYPE.bKing;
  }

  public addSecondPlayer(User: User, Color: boolean) {
    if (this.isWaiting) {
      this.isWaiting = false;
      if (Color) {
        this.players.White = User;
      } else {
        this.players.Black = User;
      }
    }
  }

  public switchTurn() {
    this.turn = !this.turn;
    // send request
  }
}
