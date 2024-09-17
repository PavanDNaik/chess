import { atom } from "recoil";

export type GameInfoType = {
  waitingForRoom: boolean;
  roomId: number | "WAITING";
  color: boolean | null;
};
export let gameInfoAtom = atom<GameInfoType>({
  key: "gameInfoAtom",
  default: { waitingForRoom: true, roomId: "WAITING", color: null },
});
