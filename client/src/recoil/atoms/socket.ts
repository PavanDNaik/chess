import { atom } from "recoil";

export const socketAtom = atom<WebSocket | null>({
  key: "socketAtom",
  default: null,
});
