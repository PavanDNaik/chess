import { SendingMessage, SendingMessageType } from "../store/types";
import { Pair, User } from "../user/user";
import { PIECE_TYPE, Square } from "./board";

export enum GAME_STATUS {
  RUNNING = 500,
  ENDED,
  WAITING_FOR_DISCONNECTED,
}

export interface RoomType {
  id: number;
  players: Pair;
  status: GAME_STATUS; // only 1 player is present
  turn: boolean; // black or white
  board: Square[][];
}

export class Room implements RoomType {
  id: number;
  players: Pair;
  isWaiting: boolean;
  turn: boolean;
  board: Square[][];
  status: GAME_STATUS;

  constructor(user1: User, user2: User, id: number) {
    this.id = id;
    this.players = this.getPiar(user1, user2);
    this.isWaiting = false;
    this.turn = true;
    this.board = this.prepareBoard();
    this.status = GAME_STATUS.RUNNING;
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
      this.status = GAME_STATUS.WAITING_FOR_DISCONNECTED;
    } else {
      this.status = GAME_STATUS.WAITING_FOR_DISCONNECTED;
      this.players.Black = null;
    }
  }

  private getPiar(user1: User, user2: User): Pair {
    return {
      isReady: true,
      white_id: user1.id,
      black_id: user2.id,
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
        Toggle = !Toggle;
      }
      board.push(row);
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

  public prepareBoardMessage(color: boolean) {
    let msg: SendingMessage = {
      status: SendingMessageType.FOUND_ROOM,
      RoomID: this.id,
      PayLoad: {
        board: this.board,
      },
    };
    return { ...msg, color };
  }

  public sendBoardToBlack() {
    if (this.players.Black) {
      this.players.Black.socket.send(
        JSON.stringify(this.prepareBoardMessage(false))
      );
    }
  }

  public sendBoardToWhite() {
    if (this.players.White) {
      this.players.White.socket.send(
        JSON.stringify(this.prepareBoardMessage(true))
      );
    }
  }

  public addUser(user: User) {
    if (this.players.black_id == user.id) {
      this.players.Black = user;
    }
    if (this.players.white_id == user.id) {
      this.players.White = user;
    }
  }

  public switchTurn() {
    this.turn = !this.turn;
    if (this.turn) {
      this.players.White?.socket.send(
        JSON.stringify({ status: SendingMessageType.MOVE_EXPECTED })
      );
    } else {
      this.players.Black?.socket.send(
        JSON.stringify({ status: SendingMessageType.MOVE_EXPECTED })
      );
    }
  }

  public checkForMate(color: boolean) {
    return false;
  }
}
