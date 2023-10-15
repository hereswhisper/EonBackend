import express from "express";
import { getEnv } from "./utils";
import logger from "./utils/logger";
import RouteHandler from "./handlers/RouteHandler";
import Database from "./database/DB";
import helmet from "helmet";
import WebSocket from "ws";
import crypto from "crypto";
import XMPP from "./xmpp/XMPP";

const app = express();
const PORT = getEnv("PORT") || 5555;

(async () => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(helmet());

  app.listen(PORT, () => {
    logger.log(`Server running on port ${PORT}`, "Server", "blueBright");
  });

  app.use((req, res, next) => {
    next();
  });
  await RouteHandler.initializeRoutes(app);
  await Database.connect();
  new XMPP();
})();
