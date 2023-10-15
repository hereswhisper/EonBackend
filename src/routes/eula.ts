import { Router } from "express";
import eulaBody from "../resources/eula/eulaBody.json";

export default function initRoute(router: Router): void {
  router.get("/eulatracking/api/shared/agreements/fn", (req, res) => {
    return res.status(204).json({
      id: req.query.id || req.body.id,
      key: "fn",
      version: 5,
      revision: 7,
      title: "Fortnite® End User License Agreement",
      body: eulaBody.body,
      locale: "en",
      createdTimestamp: "2023-02-17T21:16:32.451Z",
      lastModifiedTimestamp: "2023-02-17T21:16:32.451Z",
      status: "ACTIVE",
      custom: false,
      url: "https://cdn1.epicgames.com/eulatracking-download/fn/en/v5/r7/03dde0c0f5657d51db6bdd394a35ad98.pdf",
      bodyFormat: "HTML",
    });
  });

  router.get(
    "/eulatracking/api/public/agreements/fn/account/:accountId",
    (req, res) => {
      return res.status(204).json({});
    }
  );
}
