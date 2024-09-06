import { getMaxListeners, WebSocket } from "ws";
import { User } from "../user/user";
import { GAME_STATUS, Room } from "./room";
import { Position, SendingMessageType } from "../store/types";
import { PIECE_TYPE } from "./board";

export interface RoomManagerType {
  waitingUsers: User[];
  roomCount: number;
  userIdToRoom: Map<number, Room>;
}

export class RoomManager implements RoomManagerType {
  waitingUsers: User[];
  roomCount: number;
  userIdToRoom: Map<number, Room>;
  userIdToUserDetails: Map<number, User>;
  constructor() {
    this.waitingUsers = [];
    this.roomCount = 0;
    this.userIdToRoom = new Map<number, Room>();
    this.userIdToUserDetails = new Map<number, User>();
  }

  private createRoom(firstUser: User, secondUser: User) {
    const room = new Room(firstUser, secondUser, ++this.roomCount);
    this.userIdToRoom.set(firstUser.id, room);
    this.userIdToRoom.set(secondUser.id, room);
    room.sendBoardToWhite();
    room.sendBoardToBlack();
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

  public handleUser(user: User) {
    if (this.userIdToRoom.has(user.id)) {
      const room = this.userIdToRoom.get(user.id);
      if (room?.status === GAME_STATUS.WAITING_FOR_DISCONNECTED) {
        room.addUser(user);
      }
      return;
    }

    if (this.waitingUsers.length == 0) {
      this.waitingUsers.push(user);
      user.socket.send(
        JSON.stringify({ status: SendingMessageType.WAITING_FOR_ROOM })
      );
      return;
    }
    const waitingRandomUser = this.waitingUsers.pop();
    if (waitingRandomUser) {
      if (Math.random() > 0.5) {
        this.createRoom(user, waitingRandomUser);
      } else {
        this.createRoom(waitingRandomUser, user);
      }
    }
  }

  public validate(from: Position, to: Position) {
    return true;
  }

  public handleMove(color: boolean, id: number, from: Position, to: Position) {
    const room = this.userIdToRoom.get(id);
    if (!room || room.status === GAME_STATUS.ENDED) return false;
    if (room.turn !== color) return false;
    if (this.validate(from, to)) {
      room.board[to.x][to.x].pieceType = room.board[from.x][from.y].pieceType;
      room.board[from.x][from.y].pieceType = PIECE_TYPE.emptySquare;
      if (color) {
        room.players.White?.socket.send(
          JSON.stringify({
            status: SendingMessageType.OPPONENTS_MOVE,
            from: from,
            to: to,
          })
        );
      } else {
        room.players.Black?.socket.send(
          JSON.stringify({
            status: SendingMessageType.OPPONENTS_MOVE,
            from: from,
            to: to,
          })
        );
      }
      const status = room.checkForMate(!color);
      if (!status) {
        room.switchTurn();
      }
      return true;
    } else {
      return false;
    }
  }
}
