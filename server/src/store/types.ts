export enum RecievedMessageType {
  JOIN_PENDING_GAME = 200,
  START_GAME,
  OFFER_DRAW,
  RESIGN,
  NEW_GAME,
  NEXT_MOVE,
  GET_BOARD_STATUS,
  GET_GAME_STATUS,
}

export enum SendingMessageType {
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

export type RecievedMessage = {
  Type: RecievedMessageType;
  RoomID: number | "WAITING";
  PayLoad?: any;
};

export type SendingMessage = {
  Type: SendingMessageType;
  RoomID: number | "WAITING";
  PayLoad?: any;
};

export type Position = {
  x: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  y: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
};