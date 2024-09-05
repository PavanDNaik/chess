import { Pair } from "../user/user";

interface Board {
  b: number[][];
}

export interface Room {
  id: number;
  players: Pair;
  isWaiting: boolean; // only 1 player is present
  turn: boolean; // black or white
  board: Board;
}
