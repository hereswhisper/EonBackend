import { Router } from "express";

export default function initRoute(router: Router): void {
  router.get("/waitingroom/api/waitingroom", (req, res) => {
    res.status(204).end();
  });
}
