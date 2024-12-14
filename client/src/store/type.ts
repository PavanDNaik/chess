import { Square } from "./board";

export enum RecievedMessageType {
  WIN = 100,
  LOSE,
  OPPONENT_RESIGN,
  FOUND_ROOM,
  MOVE_EXPECTED,
  OPPONENTS_MOVE,
  WAITING_FOR_ROOM,
  WAITING_FOR_OPPONENTS_MOVE,
  SENDING_BOARD,
  INVALID_MOVE,
  VALID_MOVE,
}
//RecievedMessageType
export enum SendingMessageType {
  JOIN_PENDING_GAME = 200,
  START_GAME,
  OFFER_DRAW,
  RESIGN,
  NEW_GAME,
  NEXT_MOVE,
  GET_BOARD_STATUS,
  GET_GAME_STATUS,
}

export type RecievedMessage = {
  status: RecievedMessageType;
  RoomID: number | "WAITING";
  from?: Square;
  to?: Square;
  PayLoad?: any;
};

export type SendingMessage = {
  Type: SendingMessageType;
  RoomID: number | "WAITING";
  id: number;
  from?: Square;
  to?: Square;
  PayLoad?: any;
  color?: boolean;
};

export type Position = {
  x: number;
  y: number;
};

export enum PAWN_MOVES {
  ONE_STEP_STRAIGHT = 1000,
  TWO_STEP_STRAIGHT,
  DIAGONAL_CAPTURE,
  EN_PASSANT,
}