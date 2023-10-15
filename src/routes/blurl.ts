import { Router } from "express";
import path from "path";
import logger from "../utils/logger";

export default function initRoute(router: Router): void {
  router.get("/:video/:master", (req, res) => {
    switch (req.params.video) {
      case "KqnBrvsHnfYFXrvo":
        if (req.params.master === "master.blurl") {
          res.setHeader("content-type", "application/octet-stream");
          res.sendFile(
            path.join(__dirname, "..", "resources", "blurl", "master.blurl")
          );
        } else {
          logger.error(
            `Cannot get /${req.params.video}/${req.params.master}`,
            "Blurl"
          );
          return res.status(404).json({
            error: `Cannot get /${req.params.video}/${req.params.master}`,
          });
        }
        break;
      case "test":
        if (req.params.master === "test") {
          return res.status(204).json({});
        }
        break;

      default:
        logger.error(
          `/${req.params.video}/${req.params.master} does not exist.`,
          "Blurl"
        );
        return res.status(404).json({
          error: `/${req.params.video}/${req.params.master} does not exist.`,
        });
    }
  });
}
