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
    roomId: number | "WAITING"
  ) {
    if (socket == null || roomId == "WAITING") return false;
    const msg: SendingMessage = {
      Type: SendingMessageType.NEXT_MOVE,
      id: this.id,
      RoomID: roomId,
      from,
      to,
    };
    return true;
  }
}
