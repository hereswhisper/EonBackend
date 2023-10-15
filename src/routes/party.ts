import { Router } from "express";

import User from "../database/models/User";

export default function initRoute(router: Router): void {
  router.all("/party/api/v1/Fortnite/user/:accountId", async (req, res) => {
      res.json({
        
    })
  });
}
