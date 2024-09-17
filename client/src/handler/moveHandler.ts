import { Square } from "../store/board";
import { SendingMessageType, SendingMessage } from "../store/type";

export class MoveHandler {
  id: number;
  constructor(id: number) {
    this.id = id;
  }
  public handleMove(
    socket: WebSocket | null,
    from: Square,
    to: Square,
    roomId: number | "WAITING",
    color: boolean
  ) {
    if (socket == null || roomId == "WAITING") return false;
    const msg: SendingMessage = {
      Type: SendingMessageType.NEXT_MOVE,
      id: this.id,
      RoomID: roomId,
      from,
      to,
      color,
    };
    socket.send(JSON.stringify(msg));
    return true;
  }

  // public makeMove(from: Square, to: Square) {
  //   to.pieceType = from.pieceType;
  //   from.pieceType = PIECE_TYPE.emptySquare;
  // }
}
