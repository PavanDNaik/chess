import express from "express";
import { WebSocketServer } from "ws";
const PORT = process.env.PORT || 5000;
const app = express();

app.get("/", (req, res) => {
  res.send("Hii");
});

const server = app.listen(PORT, () => {
  console.log(`Listening on PORT : ${PORT}`);
});

const WSS = new WebSocketServer({ server });

WSS.on("connection", (socket) => {
  socket.on("error", (e) => {
    console.log(e);
  });

  socket.on("message", (data, isBinary) => {
    WSS.clients.forEach((client) => {
      client.send(data, { binary: isBinary });
    });
  });
});
