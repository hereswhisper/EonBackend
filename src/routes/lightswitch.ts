import { Router } from "express";
import Account, { IAccount } from "../database/models/Account";
import logger from "../utils/logger";

export default function initRoute(router: Router): void {
  router.get("/lightswitch/api/service/bulk/status", async (req, res) => {
    try {
      const token = req.headers["authorization"]
        ?.toString()
        .split("bearer ")[1];

      if (!token) {
        return res.status(403).send("Forbidden");
      }

      const user: IAccount | null = await Account.findOne({
        $or: [
          { "accessToken.0.token": token },
          { "clientToken.0.token": token },
        ],
      });

      if (!user) {
        return res.status(403).send("Forbidden");
      }

      const serviceStatus = {
        serviceInstanceId: "fortnite",
        status: "UP",
        message: "Servers up.",
        maintenanceUri: "https://discord.gg/eonfn",
        overrideCatalogIds: [],
        allowedActions: ["PLAY", "DOWNLOAD"],
        banned: user.banned || false,
        launcherInfoDTO: {},
      };

      return res.status(200).json([serviceStatus]);
    } catch (error) {
      let err = error as Error;
      logger.error(`Error: ${err.message}`, "Lightswitch");
      return res.status(500).send("Internal Server Error");
    }
  });
}
