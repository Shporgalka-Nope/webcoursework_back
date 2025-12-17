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
import {
  RegisterUser,
  LoginUser,
  CheckJWT,
} from "@Controllers/UsersController.js";

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

app.post("/api/register", async (req: Request, res: Response) => {
  try {
    const newUser = await RegisterUser(
      req.body.username,
      req.body.login,
      req.body.password
    );
    if (!newUser) {
      res.status(422).json({ success: false, message: "User already exists" });
      return;
    }
    res.status(201).json({ success: true, newUser });
  } catch (ex) {
    res.status(422).json({ success: false, message: ex });
  }
});

app.post("/api/login", async (req: Request, res: Response) => {
  const result = await LoginUser(req.body.login, req.body.password);
  if (result) {
    const { foundUser, accessToken } = result;
    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .send();
  } else {
    res.status(401).json({ message: "Credentials invalid" });
    return;
  }
});

app.get("/api/checkjwt", async (req: Request, res: Response) => {
  const userToken = req.cookies.accessToken;
  if (userToken) {
    const result = await CheckJWT(userToken);
    if (result) {
      res.status(200).json({ success: true, personality: result });
      return;
    }
  }
  res.status(401).json({ success: false, message: "Invalid JWT" });
});

app.get("/api/getMessages", async (req: Request, res: Response) => {
  const array = await GetMessagesById(
    req.query.senderId!.toString(),
    req.query.addresserId!.toString()
  );
  console.log(`return ${array}`);
  res.json(array);
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
