import { Router } from "express";

export default function initRoute(router: Router): void {
  router.get("/", (req, res) => {
    res.send("Eon is Online!");
  });
}
