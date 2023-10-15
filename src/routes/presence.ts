import { Router } from "express";

export default function initRoute(router: Router): void {
  router.all(
    "/presence/api/v1/_/:accountId/settings/subscriptions",
    (req, res) => {
      res.json([]);
    }
  );

  router.all("/presence/api/v1/_/:accountId/last-online", (req, res) => {
    res.json([]);
  });

  router.all("/presence/api/v1/_/:accountId/subscriptions", (req, res) => {
    res.json([]);
  });

  router.all(
    "/presence/api/v1/Fortnite/:accountId/subscriptions/nudged",
    (req, res) => {
      res.json([]);
    }
  );

  router.post(
    "/presence/api/v1/:namespace/:accountId/subscription/broadcast",
    (req, res) => {
      if (req.params.namespace === "Fortnite") {
        res.json({});
      }
    }
  );
}
