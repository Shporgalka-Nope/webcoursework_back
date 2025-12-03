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
import {
  GetMessagesById,
  SendMessage,
} from "@Controllers/MessageManagerController.js";
import Logger from "Middleware/Logger.js";
import cors from "cors";

const app = express();
const server = createServer(app);
const port: number = 3001;
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(cors());
app.use(Logger);

//Server health endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Server is live");
});

app.get("/api/getMessages", async (req: Request, res: Response) => {
  const array = await GetMessagesById(
    req.query.senderId!.toString(),
    req.query.addresserId!.toString()
  );
  console.log(`return ${array}`);
  res.json(array);
});

//WSS logic
io.on("connection", (socket) => {
  OnNewConnection(socket.id);
  console.log("New connection. ID: " + socket.id);
  io.emit("getUsersResponce", GetActiveConnections());

  socket.on("sendMessage", (from: string, to: string, messageText: string) => {
    console.log(
      `Transfering message\nFrom: ${from}\nTo: ${to}\nText: ${messageText}`
    );
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
