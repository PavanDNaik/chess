import { useEffect, useState } from "react";
import {
  RecievedMessage,
  RecievedMessageType,
  SendingMessage,
  SendingMessageType,
} from "../store/type";
import { PIECE_TYPE, Square } from "../store/board";
import "../css/board.css";
import { Validator } from "../handler/validator";
import { MoveHandler } from "../handler/moveHandler";
import { useRecoilState } from "recoil";
import { UserAtom } from "../recoil/atoms/user";
import { useNavigate } from "react-router-dom";

function Game() {
  const [user] = useRecoilState(UserAtom);

  const [socket, setSocket] = useState<null | WebSocket>(null);
  const [waiting, setWaiting] = useState(true);
  const [board, setBoard] = useState<null | Square[][]>(null);
  const [roomId, setRoomId] = useState<number | "WAITING">("WAITING");
  const [color, setColor] = useState<boolean | null>(null);
  const [from, setfrom] = useState<null | Square>(null);
  const validate = new Validator();
  const moveHandler = new MoveHandler(user?.id || 0);

  function connectToSocket() {
    const connection = new WebSocket("ws://localhost:5000");
    connection.onopen = () => {
      setSocket(connection);
    };
    connection.onclose = () => {
      setSocket(null);
    };
    connection.onmessage = handleMessage;
    return connection;
  }

  function swap(board: Square[][]) {
    for (let i = 0; i < 4; i++) {
      let temp = board[i];
      board[i] = board[7 - i];
      board[7 - i] = temp;
    }
    return board;
  }

  function handleMessage(e: { data: string }) {
    const msgString: string = e.data;
    const msg: RecievedMessage = JSON.parse(msgString);
    console.log(msg.status == RecievedMessageType.FOUND_ROOM);
    switch (msg.status) {
      case RecievedMessageType.FOUND_ROOM: {
        if (msg.PayLoad.color === false) {
          setBoard(swap(msg.PayLoad.board));
        } else {
          setBoard(msg.PayLoad.board);
        }
        setRoomId(msg.RoomID);
        setColor(msg.PayLoad.color);
        setWaiting(false);
      }
    }
  }

  function handlePieceClick(to: Square) {
    if (!board) return;
    if (
      (to.pieceType == PIECE_TYPE.emptySquare && from == null) ||
      color == null
    )
      return;
    if (to.color == color) {
      setfrom(to);
      return;
    }
    if (
      from &&
      validate.validateMove(from, to) &&
      moveHandler.handleMove(socket, from, to, roomId)
    ) {
      board[to.x][to.y].pieceType = from.pieceType;
      board[from.x][from.y].pieceType = PIECE_TYPE.emptySquare;
      setBoard([...board]);
    }
    setfrom(null);
  }

  useEffect(() => {
    if (!user) {
      const navigate = useNavigate();
      navigate("/login");
    }
    const connection = connectToSocket();
    return () => {
      connection.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      const msg: SendingMessage = {
        Type: SendingMessageType.NEW_GAME,
        RoomID: "WAITING",
        PayLoad: user,
        id: user?.id || 0,
      };
      socket.send(JSON.stringify(msg));
    }
  }, [socket, user]);
  if (!socket) {
    return <div>connecting to server...</div>;
  }

  if (waiting) {
    return <div>Looking for opponent..</div>;
  }

  return (
    <div>
      opponent found
      <div>room ID : {roomId}</div>
      <div className="board-container">
        {board &&
          board.map((row: Square[], i) => {
            return (
              <div className="board-row" key={i}>
                {row.map((cell: Square, j) => {
                  return (
                    <div
                      key={i * 8 + j}
                      onClick={() => {
                        handlePieceClick(cell);
                      }}
                      className={
                        "Square " +
                        (cell.color ? "WhiteSquare " : "BlackSquare ") +
                        (cell.pieceType != PIECE_TYPE.emptySquare
                          ? "piece-cell"
                          : "")
                      }
                    >
                      {cell.pieceType != PIECE_TYPE.emptySquare && (
                        <img
                          className="piece-img"
                          src={"./pieces/" + cell.pieceType + ".png"}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Game;
