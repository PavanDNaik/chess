import { atom } from "recoil";

interface User {
  name: string;
  id: number;
  roomID?: number;
  email?: string;
}

function loclaStorageEffect(key: string) {
  return ({ setSelf, onSet }: any) => {
    const user = localStorage.getItem(key);
    if (user) {
      setSelf(JSON.parse(user));
    }
    onSet((newValue: any, _: any, isReset: any) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };
}

export const UserAtom = atom<User | null>({
  key: "User",
  default: null,
  effects: [loclaStorageEffect("user")],
});
