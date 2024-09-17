import { WebSocket } from "ws";
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
    firstUser.socket.onclose = () => {
      this.inMatchDisconnectHandler(firstUser, room, true);
    };
    secondUser.socket.onclose = () => {
      this.inMatchDisconnectHandler(secondUser, room, false);
    };
    room.sendBoardToWhite();
    room.sendBoardToBlack();
  }

  private inMatchDisconnectHandler(user: User, room: Room, color: boolean) {
    if (color) {
      room.disconnectHandlerToWhite();
    } else {
      room.disconnectHandlerToBlack();
    }
    this.removeFromMap(user.id);
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

  private removeFromMap(id: number) {
    this.userIdToUserDetails.delete(id);
  }

  private onCloseRemoveFromWaiting(user: User) {
    user.socket.onclose = () => {
      this.removeFromMap(user.id);
      this.waitingUsers = this.waitingUsers.filter(
        (eachUser) => eachUser != user
      );
    };
  }

  public handleUser(user: User) {
    if (this.userIdToRoom.has(user.id)) {
      const room = this.userIdToRoom.get(user.id);
      if (room?.status === GAME_STATUS.WAITING_FOR_DISCONNECTED) {
        user.socket.close = () => {
          this.removeFromMap(user.id);
          if (room.players.black_id == user.id) {
            room.disconnectHandlerToBlack();
          } else if (room.players.white_id == user.id) {
            room.disconnectHandlerToWhite();
          }
        };
        room.addUser(user);
      }
      return;
    }

    if (this.waitingUsers.length == 0) {
      this.waitingUsers.push(user);
      user.socket.send(
        JSON.stringify({ status: SendingMessageType.WAITING_FOR_ROOM })
      );
      this.onCloseRemoveFromWaiting(user);
      return;
    }
    const waitingRandomUser = this.waitingUsers.pop();
    if (waitingRandomUser) {
      // console.log(waitingRandomUser);
      // console.log(user);
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
    // if (room.turn !== color) return false;
    if (this.validate(from, to)) {
      if (color) {
        room.board[7 - to.x][to.y].pieceType =
          room.board[7 - from.x][from.y].pieceType;
        room.board[7 - from.x][from.y].pieceType = PIECE_TYPE.emptySquare;
      } else {
        room.board[to.x][to.y].pieceType = room.board[from.x][from.y].pieceType;
        room.board[from.x][from.y].pieceType = PIECE_TYPE.emptySquare;
      }
      if (color == false) {
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
