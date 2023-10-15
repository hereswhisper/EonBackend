import { Router } from "express";

export default function initRoute(router: Router): void {
  router.get("/fortnite/api/v2/versioncheck/:version", (req, res) => {
    res.json({
      type: "NO_UPDATE",
    });
  });

  router.get("/fortnite/api/versioncheck/:version", (req, res) => {
    res.json({
      type: "NO_UPDATE",
    });
  });
}
