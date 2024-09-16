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
import { socketAtom } from "../recoil/atoms/socket";

function Game() {
  const [user] = useRecoilState(UserAtom);

  const [socket, setSocket] = useRecoilState(socketAtom);

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
    connection.onmessage = handleMessage;
    return connection;
  }

  function swapCells(row1: Square[], row2: Square[]) {
    for (let i = 0; i < 8; i++) {
      let tType: PIECE_TYPE = row1[i].pieceType;
      row1[i].pieceType = row2[i].pieceType;
      row2[i].pieceType = tType;
    }
  }

  function swap(board: Square[][]) {
    for (let i = 0; i < 4; i++) {
      swapCells(board[i], board[7 - i]);
    }
    console.log(board);
    return board;
  }

  function handleMessage(e: { data: string }) {
    const msgString: string = e.data;
    const msg: RecievedMessage = JSON.parse(msgString);
    switch (msg.status) {
      case RecievedMessageType.FOUND_ROOM: {
        if (msg.PayLoad.color === true) {
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

  function makeMove(from: Square, to: Square) {
    if (!board) return;
    to.pieceType = from.pieceType;
    from.pieceType = PIECE_TYPE.emptySquare;
    setBoard([...board]);
  }

  function handlePieceClick(to: Square) {
    if (!board || color == null) return;
    if (from == null) {
      if (validate.isSameColor(color, to)) {
        setfrom(to);
        // highlight
      }
      return;
    } else {
      if (validate.isSameColor(color, to)) {
        setfrom(to);
        return; // cant take ur own piece
      }
      if (validate.validateMove(from, to, color, board)) {
        moveHandler.handleMove(socket, from, to, roomId);
        makeMove(from, to);
      }
      setfrom(null);
    }
  }

  function classOnClicked(x: number, y: number) {
    if (from == null || from.x != x || from.y != y) return "";
    return " from-piece-highlight";
  }

  useEffect(() => {
    if (!user) {
      const navigate = useNavigate();
      navigate("/login");
    }
    let connection = connectToSocket();
    connection.onclose = () => {
      const timer = setInterval(() => {
        if (socket) {
          clearInterval(timer);
        } else {
          connection = connectToSocket();
        }
      }, 5000);
    };
    return () => {
      connection.close();
      setSocket(null);
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.onclose = (e) => {
        console.log(e);
        setSocket(null);
      };

      const msg: SendingMessage = {
        Type: SendingMessageType.NEW_GAME,
        RoomID: "WAITING",
        PayLoad: user,
        id: user?.id || 0,
      };
      socket.send(JSON.stringify(msg));
    }
  }, [socket, user]);

  return (
    <div>
      {!socket ? (
        <div>connecting to server...</div>
      ) : (
        <div>
          {waiting ? (
            <div>Looking for opponent..</div>
          ) : (
            <div>
              opponent found
              <div>room ID : {roomId}</div>
              <div className="board-container">
                {board &&
                  board.map((row: Square[], i: number) => {
                    return (
                      <div className="board-row" key={i}>
                        {row.map((cell: Square, j: number) => {
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
                                  : "") +
                                classOnClicked(i, j)
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
          )}
        </div>
      )}
    </div>
  );
}

export default Game;
