import { useEffect, useState } from "react";
import {
  RecievedMessage,
  RecievedMessageType,
  SendingMessage,
  SendingMessageType,
} from "../store/type";
export type User = {
  name: string;
  id: number;
};

function Game() {
  const [socket, setSocket] = useState<null | WebSocket>(null);
  const [waiting, setWaiting] = useState(true);
  const [data, setData] = useState<User>({ name: "", id: 0 });
  useEffect(() => {
    const connection = new WebSocket("ws://localhost:5000");
    connection.onopen = () => {
      setSocket(connection);
      const msg: SendingMessage = {
        Type: SendingMessageType.NEW_GAME,
        RoomID: "WAITING",
        PayLoad: {
          name: "pavan",
          id: 1,
        },
      };
      connection.send(JSON.stringify(msg));
    };

    connection.onclose = () => {
      setSocket(null);
    };

    connection.onmessage = (e) => {
      const msg: RecievedMessage = e.data;
      switch (msg.status) {
        case RecievedMessageType.FOUND_ROOM: {
          setWaiting(false);
        }
      }
    };

    return () => {
      connection.close();
    };
  }, []);

  useEffect(() => {
    if (waiting && socket) {
      // socket.send();
    }
  }, [socket]);
  if (!socket) {
    return (
      <div>
        <input
          type="text"
          onChange={(e) => {
            setData({ ...data, name: e.target.value });
          }}
        />
        <input
          type="number"
          onChange={(e) => {
            setData({ ...data, id: Number(e.target.value) });
          }}
        />
        Connecting...
      </div>
    );
  }

  if (waiting) {
    return <div>Looking for opponent..</div>;
  }

  return <div>oppoennt found</div>;
}

export default Game;
