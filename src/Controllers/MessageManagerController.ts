import Message from "@ORM/Models/Message.js";

export function SendMessage(from: string, to: string, text: string) {
  const message = Message.create({ from: from, to: to, text: text });
}
