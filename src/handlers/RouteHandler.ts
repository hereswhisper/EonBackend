import { readdirSync } from "fs";
import { join } from "path";
import logger from "../utils/logger";
import express, { Application } from "express";

/**
 * Dynamically initializes routes in an Express application from route modules.
 * @param {Application} app - The Express application to which routes will be attached.
 * @returns {Promise<void>} A promise that resolves when all routes are initialized.
 */
export default {
  async initializeRoutes(app: Application): Promise<void> {
    try {
      const routesPath = join(__dirname, "..", "routes");
      const files = readdirSync(routesPath).filter(
        (file) => file.endsWith(".ts") || file.endsWith(".js")
      );

      for (const file of files) {
        const RouteModule = await import(join(__dirname, "..", "routes", file));

        if (RouteModule.default && typeof RouteModule.default === "function") {
          RouteModule.default(app);
          logger.log(`Loaded Route ${file}.`, "RouteHandler", "greenBright");
        } else {
          logger.error(
            `${file} does not export a valid route initializer`,
            "RouteHandler"
          );
        }
      }
    } catch (error) {
      let err = error as Error;
      logger.error(`Error initializing routes: ${err.message}`, "RouteHandler");
      throw error;
    }
  },
};
