import { Router } from "express";
import fs from "fs";
import path from "path";
import { v4 as generateUUID } from "uuid";
import logger from "../utils/logger";
import User from "../database/models/User";
import { getEnv } from "../utils";
import axios from "axios";

interface Servers {
  eu: ServersData[];
  nae: ServersData[];
  custom: ServersData[];
}

interface ServersData {
  playlist: string;
  ip: string;
  port: number;
  session: string;
  joinAble: boolean;
  maxPlayers: number;
  current: number;
  customCode: string;
}

export default function initRoute(router: Router): void {
  router.get(
    "/fortnite/api/matchmaking/session/findPlayer/*",
    async (req, res) => {
      res.status(200).end();
    }
  );

  router.get(
    "/fortnite/api/game/v2/matchmakingservice/ticket/player/*",
    async (req, res) => {
      res.cookie(
        "currentbuildUniqueId",
        (req.query.bucketId as string).split(":")[0]
      );

      let bucketId = req.query.bucketId as string;

      if (bucketId && bucketId.split(":")[2] && bucketId.split(":")[3]) {
        logger.log(
          `Current BucketId: ${bucketId}`,
          "Matchmaking",
          "magentaBright"
        );

        return res.status(204).json({
          serviceUrl: "ws://135.148.28.59:442",
          ticketType: "mms-player",
          payload:
            "account " + bucketId.split(":")[2] + " " + bucketId.split(":")[3],
          signature: `${bucketId.split(":")}`,
        });
      } else {
        return res.json({});
      }
    }
  );

  router.get(
    "/fortnite/api/game/v2/matchmaking/account/:accountId/session/:sessionId",
    async (req, res) => {
      res.json({
        accountId: req.params.accountId,
        sessionId: req.params.sessionId,
        key: "AOJEv8uTFmUh7XM2328kq9rlAzeQ5xzWzPIiyKn2s7s=",
      });
    }
  );

  router.get(
    "/fortnite/api/matchmaking/session/:sessionId",
    async (req, res) => {
      const { sessionId } = req.params;

      const response = await axios.get(
        `http://135.148.28.59/eon/gs/match/search/${req.params.sessionId}`
      );

      if (!response.data) return;

      let ipString: string = response.data.split(" ")[1];
      let serverAddress: string = ipString.split(":")[0];
      let serverPort: string = ipString.split(":")[1];

      logger.log(
        `${serverAddress}:${serverPort}`,
        "Matchmaking",
        "magentaBright"
      );

      res.json({
        id: sessionId,
        ownerId: generateUUID().replace(/-/gi, "").toUpperCase(),
        ownerName: "[DS]fortnite-liveeugcec1c2e30ubrcore0a-z8hj-1968",
        serverName: "[DS]fortnite-liveeugcec1c2e30ubrcore0a-z8hj-1968",
        serverAddress,
        serverPort,
        maxPublicPlayers: 220,
        openPublicPlayers: 175,
        maxPrivatePlayers: 0,
        openPrivatePlayers: 0,
        attributes: {
          REGION_s: "EU",
          GAMEMODE_s: "FORTATHENA",
          ALLOWBROADCASTING_b: true,
          SUBREGION_s: "GB",
          DCID_s: "FORTNITE-LIVEEUGCEC1C2E30UBRCORE0A-14840880",
          tenant_s: "Fortnite",
          MATCHMAKINGPOOL_s: "Any",
          STORMSHIELDDEFENSETYPE_i: 0,
          HOTFIXVERSION_i: 0,
          PLAYLISTNAME_s: "Playlist_DefaultSolo",
          SESSIONKEY_s: generateUUID().replace(/-/gi, "").toUpperCase(),
          TENANT_s: "Fortnite",
          BEACONPORT_i: 15009,
        },
        publicPlayers: [],
        privatePlayers: [],
        totalPlayers: 45,
        allowJoinInProgress: false,
        shouldAdvertise: false,
        isDedicated: false,
        usesStats: false,
        allowInvites: false,
        usesPresence: false,
        allowJoinViaPresence: true,
        allowJoinViaPresenceFriendsOnly: false,
        buildUniqueId: 12582667,
        lastUpdated: new Date().toISOString(),
        started: false,
      });
    }
  );

  router.post("/fortnite/api/matchmaking/session/*/join", async (req, res) => {
    res.status(204).end();
  });

  router.post(
    "/fortnite/api/matchmaking/session/matchMakingRequest",
    async (req, res) => {
      res.json([]);
    }
  );
}
