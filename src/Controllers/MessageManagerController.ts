import Message from "@ORM/Models/Message.js";
import { Op } from "sequelize";

export function SendMessage(from: string, to: string, text: string) {
  const message = Message.create({ from: from, to: to, text: text });
}

export async function GetMessagesById(sender: string, addresser: string) {
  return await Message.findAll({
    where: {
      [Op.or]: [
        {
          from: sender,
          to: addresser,
        },
        {
          from: addresser,
          to: sender,
        },
      ],
    },
  });
}
