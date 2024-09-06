import { WebSocket } from "ws";

export interface User {
  id: number;
  name: string;
  socket: WebSocket;
  roomID?: number;
}

export interface Pair {
  isReady: boolean;
  black_id: null | number;
  white_id: null | number;
  Black: User | null;
  White: User | null;
}
