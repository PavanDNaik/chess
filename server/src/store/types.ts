export enum RecievedMessageType {
  JOIN_GAME,
  START_GAME,
  OFFER_DRAW,
  RESIGN,
  NEW_GAME,
  NEXT_MOVE,
}

export enum SendingMessageType {
  WIN,
  LOSE,
  OPPONENT_RESIGN,
  FOUND_ROOM,
  MOVE_EXPECTED,
  OPPONENT_MOVED,
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
