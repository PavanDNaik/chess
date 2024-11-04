import { useEffect, useMemo } from "react";
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
import { useRecoilState, useRecoilValue } from "recoil";
import { UserAtom } from "../recoil/atoms/user";
import { useNavigate } from "react-router-dom";
import { socketAtom } from "../recoil/atoms/socket";
import { boardAtom } from "../recoil/atoms/board";
import { gameInfoAtom } from "../recoil/atoms/gameStatus";
import Board from "../component/Board";

function Game() {
  const navigate = useNavigate();

  const user = useRecoilValue(UserAtom);
  const [socket, setSocket] = useRecoilState(socketAtom);
  const [board, setBoard] = useRecoilState(boardAtom);
  const [gameInfo, setGameInfo] = useRecoilState(gameInfoAtom);

  const validate = useMemo(() => {
    return new Validator();
  }, []);

  const moveHandler = useMemo(() => {
    return new MoveHandler(user?.id || 0);
  }, [user]);

  function makeMove(from: Square, to: Square) {
    setBoard((prev) => {
      return prev.map((row) => {
        return row.map((cell) => {
          if (cell.x == to.x && cell.y == to.y) {
            return { ...cell, pieceType: from.pieceType };
          }
          if (cell.x == from.x && cell.y == from.y) {
            return { ...cell, pieceType: PIECE_TYPE.emptySquare };
          }
          return cell;
        });
      });
    });
  }

  const handleMessage = (e: { data: string }) => {
    let msgString: string = e.data;
    let msg: RecievedMessage = JSON.parse(msgString);
    switch (msg.status) {
      case RecievedMessageType.FOUND_ROOM: {
        console.log("Loading board...");
        // setBoard(msg.PayLoad.board);
        setGameInfo({
          ...gameInfo,
          roomId: msg.RoomID,
          color: msg.PayLoad.color,
          waitingForRoom: false,
        });
        break;
      }
      case RecievedMessageType.OPPONENTS_MOVE: {
        let from = msg.from;
        let to = msg.to;
        if (from && to) {
          // console.log(from);
          // console.log(to);
          makeMove(from, to);
        }
        break;
      }
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
    let connection = new WebSocket("ws://localhost:5000");

    connection.onopen = () => {
      setSocket(connection);
      const msg: SendingMessage = {
        Type: SendingMessageType.NEW_GAME,
        RoomID: "WAITING",
        PayLoad: user,
        id: user?.id || 0,
      };
      connection.send(JSON.stringify(msg));
    };

    connection.onmessage = handleMessage;

    connection.onerror = (e) => {
      console.log("Socket connection error");
      console.log(e);
    };
    return () => {
      setSocket(null);
      connection.close();
      console.log("closed by cleanup");
    };
  }, []);

  return (
    <div>
      {!socket ? (
        <div>connecting to server...</div>
      ) : (
        <div>
          {gameInfo.waitingForRoom || gameInfo.color == null ? (
            <div>Looking for opponent..</div>
          ) : (
            <div>
              opponent found
              <div>room ID : {gameInfo.roomId}</div>
              <Board
                color={gameInfo.color}
                validate={validate}
                moveHandler={moveHandler}
                board={board}
                makeMove={makeMove}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Game;
