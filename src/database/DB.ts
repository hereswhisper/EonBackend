import { getEnv } from "../utils";
import mongoose from "mongoose";
import logger from "../utils/logger";

const DB_URL = getEnv("DATABASE_URL");

export default {
  async connect(): Promise<void> {
    mongoose.set("strictQuery", true);
    // console.log(DB_URL);
    mongoose
      .connect(DB_URL)
      .then(() => {
        logger.log("Connected to MongoDB", "Database", "magentaBright");
      })
      .catch((error) => {
        logger.error(`MongoDB Connection Error: ${error.message}`, "Database");
        throw error; // Re-throw the error to propagate it if needed.
      });
  },
};
