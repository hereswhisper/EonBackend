import { Router } from "express";
import User, { IUser } from "../database/models/User";
import logger from "../utils/logger";
import { sendErrorResponse } from "./oauth";

export default function initRoute(router: Router): void {
  router.all("/api/v1/search/:accountId", async (req, res) => {
    const accountId = req.params.accountId;
    const { prefix } = req.query;
    const user = await User.find({
      username: { $regex: accountId, $options: "i" },
    }).lean();
    console.log(accountId);

    if (!user) {
      return res.json([]);
    } else {
      console.log(accountId);

      if (prefix != undefined) {
        const friend = await User.find({
          username: { $regex: accountId, $options: "i" },
        }).lean();

        if (friend) {
          let data: any[] = [];

          for (const index of friend) {
            return data.push({
              accountId: index.accountId,
              matches: [
                {
                  value: index.username,
                  platform: "epic",
                },
              ],
              matchType: "prefix",
              epicMutuals: 0,
              sortPosition: 1,
            });
          }
          return res.json(data);
        } else {
          return res.json([]);
        }
      } else {
        let data: any[] = [];

        for (const index of user) {
          return data.push({
            accountId: index.accountId,
            matches: [
              {
                value: index.username,
                platform: "epic",
              },
            ],
            matchType: "prefix",
            epicMutuals: 0,
            sortPosition: 1,
          });
        }
        return res.json(data);
      }
    }
  });

  router.all("/friends/api/v1/:accountId/settings", (req, res) => {
    return res.status(204).json({
      acceptInvites: "public",
    });
  });

  router.get("/friends/api/v1/:accountId/summary", async (req, res) => {
    const { accountId } = req.params;

    try {
      const friends = await User.findOne({ accountId }).lean();

      if (!friends) {
        return logger.error(`User ${accountId} not found`, "Friends");
      }

      if (friends) {
        const incoming = Array.isArray(friends.friends?.incoming?.defaults)
          ? friends.friends.incoming.defaults.map((index: any) => ({
              accountId: index.accountId,
              mutual: 0,
              favorite: false,
              created: new Date().toISOString(),
            }))
          : [];

        const outgoing = Array.isArray(friends.friends?.outgoing?.default)
          ? friends.friends.outgoing.default.map((index: any) => ({
              accountId: index.accountId,
              mutual: 0,
              favorite: false,
              created: new Date().toISOString(),
            }))
          : [];

        const accepted = Array.isArray(friends.friends?.accepted?.default)
          ? friends.friends.accepted.default.map((index: any) => ({
              accountId: index.accountId,
              groups: [],
              mutual: 0,
              alias: "",
              note: "",
              favorite: false,
              created: new Date().toISOString(),
            }))
          : [];

        return res.json({
          friends: accepted,
          incoming: incoming,
          outgoing: outgoing,
          suggested: [
            {
              accountId,
              mutual: 0,
            },
          ],
          blocklist: [],
          settings: {
            acceptInvites: "public",
          },
        });
      } else {
        return res.json({
          friends: [],
          incoming: [],
          outgoing: [],
          suggested: [],
          blocklist: [],
          settings: {
            acceptInvites: "public",
          },
        });
      }
    } catch (error) {
      const err = error as Error;
      logger.error(
        `/friends/api/v2/${req.params.accountId}/summary ${err.message}`,
        "Friends"
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get(
    "/account/api/public/account/displayName/:displayName",
    async (req, res) => {
      const { displayName } = req.params;
      const user = await User.findOne({
        username: { $regex: displayName, $options: "i" },
      }).lean();

      if (user) {
        return res.json({
          id: user.accountId,
          displayName: user.username,
          externalAuths: {},
        });
      } else {
        return sendErrorResponse(
          res,
          "FriendNotFound",
          `${displayName} not found`
        );
      }
    }
  );

  router.get("/friends/api/public/friends/:accountId", async (req, res) => {
    const { accountId } = req.params;
    const user = await User.findOne({ accountId }).lean();

    try {
      if (user) {
        const incoming = Array.isArray(user.friends?.incoming?.defaults)
          ? user.friends.incoming.defaults.map((index: any) => ({
              accountId: index.accountId,
              status: "PENDING",
              direction: "INBOUND",
              created: new Date().toISOString(),
              favorite: false,
            }))
          : [];

        const outgoing = Array.isArray(user.friends?.outgoing?.default)
          ? user.friends.outgoing.default.map((index: any) => ({
              accountId: index.accountId,
              status: "PENDING",
              direction: "OUTBOUND",
              created: new Date().toISOString(),
              favorite: false,
            }))
          : [];

        const accepted = Array.isArray(user.friends?.accepted?.default)
          ? user.friends.accepted.default.map((index: any) => ({
              accountId: index.accountId,
              status: "ACCEPTED",
              direction: "INBOUND",
              created: new Date().toISOString(),
              favorite: false,
            }))
          : [];

        return res.json(incoming);
      } else {
        return res.json({
          friends: [],
          incoming: [],
          outgoing: [],
          suggested: [],
          blocklist: [],
          settings: {
            acceptInvites: "public",
          },
        });
      }
    } catch (error) {
      return res.json({ error: "Internal Server Error" });
    }
  });

  router.get("/friends/api/public/blocklist/*", async (req, res) => {
    const { accountId } = req.query.accountId || req.body;

    const account = await User.findOne({ accountId }).lean();

    if (!account) {
      return res.status(404).json([]);
    }

    return res.json({
      blockedUsers: Array.isArray(account.friends?.blocked?.["default"])
        ? account.friends.blocked["default"].map((user: any) => user.accountId)
        : [],
    });
  });
}
