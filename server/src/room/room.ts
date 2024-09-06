import { SendingMessage, SendingMessageType } from "../store/types";
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

  constructor(user1: User, user2: User, id: number) {
    this.id = id;
    this.players = this.getPiar(user1, user2);
    this.isWaiting = false;
    this.turn = true;
    this.board = this.prepareBoard();
    this.addCloseListeners(user1, true);
    this.addCloseListeners(user2, false);
  }

  private addCloseListeners(user: User, color: boolean) {
    const socket = user.socket;
    socket.onclose = () => {
      this.isWaiting = true;
      this.removePlayer(color);
    };
  }

  private removePlayer(color: boolean) {
    if (color) {
      this.players.White = null;
    } else {
      this.players.Black = null;
    }
  }

  private getPiar(user1: User, user2: User): Pair {
    return {
      isReady: true,
      White: user1,
      Black: user2,
    };
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

  public sendBoards() {
    let msg: SendingMessage = {
      Type: SendingMessageType.FOUND_ROOM,
      RoomID: this.id,
      PayLoad: {
        board: this.board,
      },
    };
    if (this.players.Black) {
      this.players.Black.socket.send(JSON.stringify({ ...msg, color: false }));
    }
    if (this.players.White) {
      this.players.White.socket.send(JSON.stringify({ ...msg, color: true }));
    }
  }

  public switchTurn() {
    this.turn = !this.turn;
    // send request
  }
}
