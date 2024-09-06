import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { RoomManager } from "./room/roomManager";
import { User } from "./user/user";
import { RecievedMessageType, SendingMessageType } from "./store/types";
const PORT = process.env.PORT || 5000;
const app = express();

app.get("/", (req, res) => {
  res.send("Hii");
});

const server = app.listen(PORT, () => {
  console.log(`Listening on PORT : ${PORT}`);
});

const WSS = new WebSocketServer({ server });

const roomManager = new RoomManager();

WSS.on("connection", (socket) => {
  socket.on("error", (e) => {
    console.log(e);
  });

  socket.on("message", (data, isBinary) => {
    try {
      // console.log(data.toString());
      const msg = JSON.parse(data.toString());
      if (!msg.Type) {
        socket.send(JSON.stringify({ error: "SUS!!" }));
        socket.close();
      }
      switch (msg.Type) {
        case RecievedMessageType.NEW_GAME: {
          const user: User = roomManager.findUser(
            msg.PayLoad.id,
            msg.PayLoad.name,
            socket
          );
          roomManager.handleUser(user);
          break;
        }
        case RecievedMessageType.JOIN_PENDING_GAME: {
          const user: User = roomManager.findUser(
            msg.PayLoad.id,
            msg.PayLoad.name,
            socket
          );
          roomManager.handleUser(user);
          break;
        }
        case RecievedMessageType.NEXT_MOVE: {
          const status = roomManager.handleMove(
            msg.color,
            msg.id,
            msg.from,
            msg.to
          );
          if (status) {
            socket.send(
              JSON.stringify({
                status: SendingMessageType.VALID_MOVE,
                from: msg.from,
                to: msg.to,
              })
            );
          } else {
            socket.send(
              JSON.stringify({
                status: SendingMessageType.INVALID_MOVE,
                from: msg.from,
                to: msg.to,
              })
            );
          }
        }
      }
    } catch (e) {
      console.log(e);
      WSS.clients.forEach((client) => {
        if (client == socket) {
          client.send(JSON.stringify({ error: "Something went wrong!!" }));
        }
      });
    }
  });
});
