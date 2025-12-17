import User from "@ORM/Models/User.js";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { json, Op } from "sequelize";

export async function RegisterUser(
  username: string,
  login: string,
  password: string
) {
  if (await CheckUserExists(login, username)) {
    return null;
  }
  let newUser: User;
  const hashPass = await bcrypt.hash(password, 10);
  newUser = await User.create({
    username: username,
    login: login,
    password: hashPass,
  });
  return newUser;
}

async function CheckUserExists(login: string, username: string) {
  if (
    await User.findOne({
      where: { [Op.or]: [{ login: login }, { username: username }] },
    })
  ) {
    return true;
  }
  return false;
}

export async function LoginUser(login: string, password: string) {
  const foundUser: User | null = await User.findOne({
    where: { login: login },
  });
  if (foundUser && (await bcrypt.compare(password, foundUser!.password))) {
    const accessToken = jwt.sign(
      {
        id: foundUser!.id,
        username: foundUser!.username,
        login: foundUser!.login,
        password: foundUser!.password,
      },
      "secret"
    );
    return { foundUser, accessToken };
  } else {
    return null;
  }
}

export async function CheckJWT(key: string) {
  try {
    const userObj = jwt.verify(key, "secret") as JwtPayload;
    const user: User | null = await User.findOne({
      where: {
        id: userObj.id,
        username: userObj.username,
        login: userObj.login,
        password: userObj.password,
      },
    });
    if (user) {
      return userObj;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}
