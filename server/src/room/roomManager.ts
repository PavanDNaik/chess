import { User } from "../user/user";
import { Room } from "./room";

export interface RoomManagerType {
  waitingRooms: number[];
  roomCount: number;
  userIdToRoom: Map<number, Room>;
}

export class RoomManager implements RoomManagerType {
  waitingRooms: number[];
  roomCount: number;
  userIdToRoom: Map<number, Room>;

  constructor() {
    this.waitingRooms = [];
    this.roomCount = 0;
    this.userIdToRoom = new Map<number, Room>();
  }

  public createRoom(firstUser: User, Color: boolean) {
    const room = new Room(firstUser, ++this.roomCount, Color);
    this.userIdToRoom.set(firstUser.id, room);
  }
}
