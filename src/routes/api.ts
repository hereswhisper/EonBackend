import { Router } from "express";
import Account, { IAccount } from "../database/models/Account";
import logger from "../utils/logger";
import User, { IUser } from "../database/models/User";
import { sendErrorResponse } from "./oauth";

export default function initRoute(router: Router): void {
  router.get("/account/api/public/account/:accountId", async (req, res) => {
    try {
      const accountId = req.params.accountId;
      const user: IUser | null = await User.findOne({
        accountId,
      }).lean();

      if (!user) {
        return res.json({});
      } else if (user.banned === true) {
        return res.json({});
      }

      let displayName = user.username;

      const publicAccountInfo = {
        id: user.accountId,
        displayName,
        name: user.username,
        email: user.email,
        failedLoginAttempts: 0,
        lastLogin: new Date().toISOString(),
        numberOfDisplayNameChanges: 0,
        ageGroup: "UNKNOWN",
        headless: false,
        country: "US",
        lastName: "User",
        links: {},
        preferredLanguage: "en",
        canUpdateDisplayName: false,
        tfaEnabled: true,
        emailVerified: true,
        minorVerified: true,
        minorExpected: true,
        minorStatus: "UNKNOWN",
      };

      return res.json(publicAccountInfo);
    } catch (error) {
      let err = error as Error;
      logger.error(
        `Error while retrieving public account information: ${err.message}`,
        "API"
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/region/check", (req, res) => {
    res.status(201).end();
  });

  router.all("/fortnite/api/game/v2/world/info", (req, res) => {
    res.json({});
  });

  router.get("/account/api/public/account", async (req, res) => {
    try {
      const accountId = req.query.accountId;

      if (!accountId) {
        return res.json({});
      }

      const accountIds = Array.isArray(accountId) ? accountId : [accountId];
      const data = [];

      for (const id of accountIds) {
        const account = await User.findOne({ accountId: id });

        if (account) {
          data.push({
            id: account.accountId,
            links: {},
            displayName: account.username,
            cabinedMode: false,
            externalAuths: {},
          });
        }
      }

      return res.json(data);
    } catch (error) {
      let err = error as Error;
      logger.error(
        `Error while retrieving public account information: ${err.message}`,
        "API"
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.all("/api/v1/user/setting", async (req, res) => {
    try {
      const accountId = req.body.accountId;
      const account = await Account.findOne({ accountId });

      if (account) {
        let avatar: string = "CID_026_Athena_Commando_M";

        if (account.character.items != "") {
          avatar = account.character.items.split(":")[1];
        }

        return res.json([
          {
            accountId: account.accountId,
            key: "avatar",
            value: avatar,
          },
          {
            accountId: account.accountId,
            key: "avatarBackground",
            value: '["#B4F2FE","#00ACF2","#005679"]',
          },
          {
            accountId: account.accountId,
            key: "appInstalled",
            value: "init",
          },
        ]);
      } else {
        res.json([]);
      }
    } catch (error) {
      let err = error as Error;
      logger.error(
        `Error while retrieving user settings: ${err.message}`,
        "API"
      );
      res.json([]);
    }
  });

  router.get(
    "/account/api/public/account/:accountId/externalAuths",
    async (req, res) => {
      res.json([]);
    }
  );

  router.all(
    "/fortnite/api/game/v2/tryPlayOnPlatform/account/*",
    (req, res) => {
      res.setHeader("Content-Type", "text/plain").send(true).end();
    }
  );

  router.get("/fortnite/api/game/v2/enabled_features", (req, res) => {
    res.json([]);
  });

  router.all("/api/v1/_/:accountId/settings/subscriptions", (req, res) => {
    res.json([]);
  });

  router.all("/api/v1/_/:accountId/last-online", (req, res) => {
    res.json([]);
  });

  router.all("/api/v1/_/:accountId/subscriptions", (req, res) => {
    res.json([]);
  });

  router.all("/api/v1/Fortnite/:accountId/subscriptions/nudged", (req, res) => {
    res.json([]);
  });

  router.post("/fortnite/api/game/v2/grant_access/*", (req, res) => {
    res.json({}).status(204).end();
  });

  router.get("/launcher/api/public/distributionpoints/", (req, res) => {
    res.json({
      distributions: [
        "https://epicgames-download1.akamaized.net/",
        "https://download.epicgames.com/",
        "https://download2.epicgames.com/",
        "https://download3.epicgames.com/",
        "https://download4.epicgames.com/",
        "https://fastly-download.epicgames.com/",
      ],
    });
  });

  router.get("/eulatracking/api/shared/agreements/fn", (req, res) => {
    res.json({});
  });
}
