import { Client } from "@Classes/Client.js";
import { Connections } from "@Classes/Connections.js";
import { Socket } from "socket.io";

export function OnNewConnection(id: string) {
  Connections.ActiveConnections.push(id);
}

export function OnDisconnect(id: string) {
  const index: number = Connections.ActiveConnections.indexOf(id);
  Connections.ActiveConnections.splice(index, 1);
}

export function GetActiveConnections(): Array<string> {
  return Connections.ActiveConnections;
}
