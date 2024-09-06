import { WebSocket } from "ws";

export interface User {
  id: number;
  name: string;
  socket: WebSocket;
  roomID?: number;
}

export interface Pair {
  isReady: boolean;
  Black: User | null;
  White: User | null;
}
