import { useEffect, useState } from "react";
import {
  RecievedMessage,
  RecievedMessageType,
  SendingMessage,
  SendingMessageType,
} from "../store/type";
import { useNavigate } from "react-router-dom";
import { PIECE_TYPE, Square } from "../store/board";
import "../css/board.css";
import { Validator } from "../handler/validator";
import { MoveHandler } from "../handler/moveHandler";

export type User = {
  name: string;
  id: number;
};

function Game() {
  const [socket, setSocket] = useState<null | WebSocket>(null);
  const [waiting, setWaiting] = useState(true);
  const [board, setBoard] = useState<null | Square[][]>(null);
  const [roomId, setRoomId] = useState<number | "WAITING">("WAITING");
  const [color, setColor] = useState<boolean | null>(null);
  const [from, setfrom] = useState<null | Square>(null);

  const navigate = useNavigate();
  const validate = new Validator();
  const moveHandler = new MoveHandler();
  const [data, setData] = useState<{
    name: string;
    email: string;
    id: number;
  } | null>(null);

  function getUserDetails() {
    const localData = localStorage.getItem("user");
    if (localData) {
      const dataJSON = JSON.parse(localData);
      if (dataJSON.name && dataJSON.email && dataJSON.id) {
        setData(dataJSON);
      } else {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }

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

  function handleMessage(e: { data: string }) {
    const msgString: string = e.data;
    const msg: RecievedMessage = JSON.parse(msgString);
    console.log(msg.status == RecievedMessageType.FOUND_ROOM);
    switch (msg.status) {
      case RecievedMessageType.FOUND_ROOM: {
        setBoard(msg.PayLoad.board);
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
    if (to == from) return;
    if (from && validate.validateMove(from, to)) {
      moveHandler.handleMove(socket, from, to);
      board[to.x][to.y].pieceType = from.pieceType;
      board[from.x][from.y].pieceType = PIECE_TYPE.emptySquare;
      setBoard([...board]);
    }
    setfrom(null);
  }

  useEffect(() => {
    getUserDetails();
    const connection = connectToSocket();
    return () => {
      connection.close();
    };
  }, []);

  useEffect(() => {
    console.log(data);
    if (socket && data) {
      const msg: SendingMessage = {
        Type: SendingMessageType.NEW_GAME,
        RoomID: "WAITING",
        PayLoad: data,
      };
      socket.send(JSON.stringify(msg));
    }
  }, [socket, data]);
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
