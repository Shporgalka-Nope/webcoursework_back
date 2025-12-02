import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  "ChatDB",
  "ChatDBWorker",
  "ChatDBWorker",
  {
    host: "ARTHUR\\SQLEXPRESS",
    dialect: "mssql",
  }
);

export async function CheckHealth() {
  try {
    await sequelize.authenticate();
    console.log("Healthy");
  } catch (ex) {
    console.error("DB connection error:" + ex);
  }
}
