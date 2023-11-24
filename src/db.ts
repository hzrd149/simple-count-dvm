import { Sequelize, DataTypes } from "sequelize";
import { DB_CONNECT_STRING } from "./env.js";

export const sequelize = new Sequelize(DB_CONNECT_STRING);

export const SingleResults = sequelize.define("SingleResults", {
  filter: DataTypes.STRING,
  relay: DataTypes.STRING,
  updated: DataTypes.INTEGER,
  count: DataTypes.INTEGER,
});
