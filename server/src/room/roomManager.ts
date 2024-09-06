import { WebSocket } from "ws";
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
  userIdToUserDetails: Map<number, User>;
  constructor() {
    this.waitingRooms = [];
    this.roomCount = 0;
    this.userIdToRoom = new Map<number, Room>();
    this.userIdToUserDetails = new Map<number, User>();
  }

  private createRoom(firstUser: User, secondUser: User) {
    const room = new Room(firstUser, secondUser, ++this.roomCount);
    this.userIdToRoom.set(firstUser.id, room);
    this.userIdToRoom.set(secondUser.id, room);
    room.sendBoards();
  }

  public findUser(id: number, name: string, socket: WebSocket): User {
    const user = this.userIdToUserDetails.get(id);
    if (user) return user;
    const newUser = {
      id,
      name,
      socket,
    };
    this.userIdToUserDetails.set(id, newUser);
    return newUser;
  }

  public handleNewUser(user: User) {}
}
