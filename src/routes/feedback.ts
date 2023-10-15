import { Router } from "express";
import User, { IUser } from "../database/models/User";
import Account, { IAccount } from "../database/models/Account";
import { sendErrorResponse } from "./oauth";

export default function initRoute(router: Router): void {
  router.post("/fortnite/api/feedback/:accountId", async (req, res) => {
    const { accountId } = req.params;
    console.log("[FeedBack] AccountId " + accountId);

    const user: IUser | null = await User.findOne({ accountId });
    const token = req.headers["authorization"]?.split("bearer ")[1];

    if (!token) {
      return res.json({});
    }

    if (!user) {
      return res.status(404).json({ error: "User does not exist." });
    }

    if (user) {
      if (token) {
        const accountToken: IAccount | null = await Account.findOne({
          ["accessToken[0].token"]: token,
        });

        if (!accountToken) {
          return res
            .status(404)
            .json({ error: "AccountToken is expired or does not exist." });
        }

        if (accountToken) {
          return sendErrorResponse(res, "BadRequest", "Missing start boundary");
        } else {
          return res.status(403).json({});
        }
      } else {
        return res.status(403).json({});
      }
    }
  });
}
