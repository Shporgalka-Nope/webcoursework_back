import express from "express";
import type { Request, Response } from "express";
import { createServer, type IncomingMessage } from "http";
import { sequelize, CheckHealth } from "@ORM/sequelize.js";
import { Server } from "socket.io";
import {
  GetActiveConnections,
  OnDisconnect,
  OnNewConnection,
} from "@Controllers/ConnectionsManagerController.js";
import { SendMessage } from "@Controllers/MessageManagerController.js";

const app = express();
const server = createServer(app);
const port: number = 3001;
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//Server health endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Server is live");
});

//WSS logic
io.on("connection", (socket) => {
  console.log("New connection. ID: " + socket.id);
  OnNewConnection(socket.id);

  //Client requested user list
  socket.on("getUsers", () => {
    io.emit("getUsersResponce", GetActiveConnections());
  });

  socket.on("sendMessage", (from: string, to: string, messageText: string) => {
    console.log(from, to, messageText);
    SendMessage(from, to, messageText);

    io.to(to).emit("recieveMessage", from, to, messageText);
  });

  //On disconnect
  socket.on("disconnect", (reason) => {
    console.log(`Client ${socket.id} has disconnected with reason: ${reason}`);
    OnDisconnect(socket.id);
    io.emit("getUsersResponce", GetActiveConnections());
  });
});

await sequelize.sync({ force: true });
console.log("Tables re-created");

server.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
