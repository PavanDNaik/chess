import { useEffect, useState } from "react";
import {
  RecievedMessage,
  RecievedMessageType,
  SendingMessage,
  SendingMessageType,
} from "../store/type";
import { useNavigate } from "react-router-dom";
import { Square } from "../store/board";
export type User = {
  name: string;
  id: number;
};
import "../css/board.css";
function Game() {
  const [socket, setSocket] = useState<null | WebSocket>(null);
  const [waiting, setWaiting] = useState(true);
  const [board, setBoard] = useState<null | Square[][]>(null);
  const [roomId, setRoomId] = useState<number | "WAITING">("WAITING");
  let data: { name: string; email: string; id: number } = {
    name: "",
    email: "",
    id: 0,
  };

  const navigate = useNavigate();
  function getUserDetails() {
    const localData = localStorage.getItem("user");
    if (localData) {
      const dataJSON = JSON.parse(localData);
      if (dataJSON.name && dataJSON.email && dataJSON.id) {
        data = dataJSON;
      } else {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }

  useEffect(() => {
    getUserDetails();
    const connection = new WebSocket("ws://localhost:5000");
    connection.onopen = () => {
      setSocket(connection);
      const msg: SendingMessage = {
        Type: SendingMessageType.NEW_GAME,
        RoomID: "WAITING",
        PayLoad: data,
      };
      connection.send(JSON.stringify(msg));
    };

    connection.onclose = () => {
      setSocket(null);
    };

    connection.onmessage = (e) => {
      const msgString: string = e.data;
      const msg: RecievedMessage = JSON.parse(msgString);
      console.log(msg.status == RecievedMessageType.FOUND_ROOM);
      switch (msg.status) {
        case RecievedMessageType.FOUND_ROOM: {
          setBoard(msg.PayLoad.board);
          setWaiting(false);
        }
      }
    };

    return () => {
      // if (connection.readyState === 1) {
      connection.close();
      // }
    };
  }, []);

  useEffect(() => {
    if (waiting && socket) {
      // socket.send();
    }
  }, [socket]);
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
              <div className="board-row">
                {row.map((cell: Square, j) => {
                  return (
                    <div
                      key={i * 8 + j}
                      className={
                        "Square " + (cell.color ? "WhiteSquare" : "BlackSquare")
                      }
                    ></div>
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
