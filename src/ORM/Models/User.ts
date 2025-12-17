import { sequelize } from "@ORM/sequelize.js";
import { DataTypes, Model, type Optional } from "sequelize";

interface UserAttributes {
  id: string;
  username: string;
  login: string;
  password: string;
}

export interface UserInput extends Optional<UserAttributes, "id"> {}

class User extends Model<UserAttributes, UserInput> implements UserAttributes {
  declare id: string;
  declare username: string;
  declare login: string;
  declare password: string;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: true, sequelize: sequelize }
);

export default User;
