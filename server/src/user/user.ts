import { WebSocket } from "ws";

export interface User {
  id: number;
  name: string;
  socket: WebSocket;
  roomID?: number;
}

export interface Pair {
  Black: User;
  White: User;
}
