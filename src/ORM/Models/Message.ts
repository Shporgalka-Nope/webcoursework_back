import { sequelize } from "ORM/sequelize.js";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

interface MessageAttributes {
  id: string;
  from: string;
  to: string;
  text: string;
}

export interface MessageInput extends Optional<MessageAttributes, "id"> {}

class Message
  extends Model<MessageAttributes, MessageInput>
  implements MessageAttributes
{
  public id: string;
  public from: string;
  public to: string;
  public text: string;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: true, sequelize: sequelize }
);

export default Message;
