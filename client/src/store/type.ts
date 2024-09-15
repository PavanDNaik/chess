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
  from?: Position;
  to?: Position;
  PayLoad?: any;
};

export type SendingMessage = {
  Type: SendingMessageType;
  RoomID: number | "WAITING";
  id: number;
  from?: Square;
  to?: Square;
  PayLoad?: any;
};

export type Position = {
  x: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  y: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
};
