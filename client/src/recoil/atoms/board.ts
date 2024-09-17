import { atom } from "recoil";
import { Square } from "../../store/board";

const boardAtom = atom<null | Square[][]>({
  key: "boardAtom",
  default: null,
});

export { boardAtom };
