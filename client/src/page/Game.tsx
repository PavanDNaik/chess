import { useCallback, useEffect, useMemo } from "react";
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

  const connectToSocket = () => {
    const connection = new WebSocket("ws://localhost:5000");
    connection.onopen = () => {
      if (socket) {
        socket.close();
      }
      setSocket(connection);
    };
    connection.onmessage = handleMessage;
    connection.onerror = (e) => {
      console.log(e);
    };
    return connection;
  };

  const swapCells = useCallback((row1: Square[], row2: Square[]) => {
    for (let i = 0; i < 8; i++) {
      let tType: PIECE_TYPE = row1[i].pieceType;
      row1[i].pieceType = row2[i].pieceType;
      row2[i].pieceType = tType;
      row1[i].color = !row1[i].color;
      row2[i].color = !row2[i].color;
    }
  }, []);

  const swap = useCallback((board: Square[][]) => {
    for (let i = 0; i < 4; i++) {
      swapCells(board[i], board[7 - i]);
    }
    return board;
  }, []);

  const getCopy = useCallback((board: Square[][])=> {
    let b: Square[][] = [];
    for (let i = 0; i < 8; i++) {
      let row: Square[] = [];
      for (let j = 0; j < 8; j++) {
        let obj: Square = { ...board[i][j] };
        row.push(obj);
      }
      b.push(row);
    }
    return b;
  },[]);

  function makeMove(from: Square, to: Square) {
    if (!board) return;
    let b: Square[][] = getCopy(board);
    b[to.x][to.y].pieceType = b[from.x][from.y].pieceType;
    b[from.x][from.y].pieceType = PIECE_TYPE.emptySquare;
    setBoard(b);
  }

  const handleMessage = (e: { data: string }) => {
    let msgString: string = e.data;
    let msg: RecievedMessage = JSON.parse(msgString);
    switch (msg.status) {
      case RecievedMessageType.FOUND_ROOM: {
        if (msg.PayLoad.color === true) {
          setBoard(swap(msg.PayLoad.board));
        } else {
          setBoard(msg.PayLoad.board);
        }
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
        console.log("ENTER");
        if (from && to) {
          from.x = 7 - from.x;
          to.x = 7 - to.x;
          console.log(from);
          console.log(to);
          makeMove(from, to);
        }
        break;
      }
    }
  };
  console.log(board);
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
    let connection = connectToSocket();

    connection.onclose = () => {
      setSocket(null);
    };
    return () => {
      connection.close();
      console.log("closed by cleanup");
      setSocket(null);
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
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Game;
