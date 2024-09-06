import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { RoomManager } from "./room/roomManager";
import { User } from "./user/user";
import { RecievedMessageType } from "./store/types";
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
      const msg = JSON.parse(data.toString());
      if (!msg.type || !msg.name) {
        socket.send(JSON.stringify({ error: "SUS!!" }));
        socket.close();
      }
      switch (msg.type) {
        case RecievedMessageType.NEW_GAME: {
          const user = roomManager.findUser(msg.id, msg.name, socket);
        }
      }
    } catch (e) {
      WSS.clients.forEach((client) => {
        if (client == socket) {
          client.send(JSON.stringify({ error: "SUS!!" }));
        }
      });
    }
  });
});
