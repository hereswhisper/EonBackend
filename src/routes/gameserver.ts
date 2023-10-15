import { Router } from "express";
import logger from "../utils/logger";
import { v4 as generateUUID } from "uuid";
import User from "../database/models/User";
import Account from "../database/models/Account";

interface ServerData {
  playlist: string;
  ip: string;
  session: string;
  port: string;
  name: string;
  isJoinable: boolean;
  maxPlayers: number;
  current: number;
}

interface Servers {
  eu: ServerData[];
  nae: ServerData[];
}

let serversData: { [region: string]: ServerData[] } = {
  eu: [],
  nae: [],
};

// From old backend but modified a bit.

export default function initRoute(router: Router): void {
  router.get(
    "/eon/gs/add/:session/:region/:ip/:port/:custom/:playlist/:maxPlayers",
    async (req, res) => {
      try {
        const { region, playlist, maxPlayers, ip, port } = req.params;

        let defaultPlaylist: string = "playlist_solos";
        let defaultMaxPlayers: number = 100;

        // Validate Region
        if (!(region in serversData)) {
          return res.status(400).json({ error: "Invalid region" });
        }

        const joinable: boolean = true;
        const maxplayers: number =
          parseInt(maxPlayers, 10) || defaultMaxPlayers;
        const currentPlayers: number = 0;
        let sessionName: string = "EonSession12";

        const session = generateUUID().replace(/-/g, "");

        serversData[region].push({
          playlist: playlist || defaultPlaylist,
          ip,
          session,
          port,
          name: sessionName,
          isJoinable: joinable,
          maxPlayers: maxplayers,
          current: currentPlayers,
        });

        res
          .status(201)
          .json({ message: `Session added to ${region} - ${sessionName}` });
      } catch (error) {
        let err = error as Error;
        logger.error(err.message, "GameServer");
        res.json({ error: "Internal Server Error" });
      }
    }
  );

  router.get("/eon/gs/lock/:region/:session", async (req, res) => {
    try {
      const { region, session } = req.params;

      // Validate Region
      if (!(region in serversData)) {
        return res.status(400).json({ error: "Invalid region" });
      }

      // Lock the specified game session
      serversData[region] = serversData[region].map((item) => {
        if (item.name === session) {
          item.isJoinable = false;
        }
        return item;
      });

      res.status(200).json({
        message: `Session '${session}' in ${region} locked successfully`,
      });
    } catch (error) {
      let err = error as Error;
      logger.error(err.message, "GameServer");
      res.json({ error: "Internal Server Error" });
    }
  });

  router.get("/eon/gs/player/remove/:session/:region", async (req, res) => {
    try {
      const { region, session } = req.params;

      // Validate region
      if (!(region in serversData)) {
        return res.status(400).json({ error: "Invalid region" });
      }

      // Remove a player from the specified game session
      serversData[region] = serversData[region].map((item) => {
        if (item.name === session) {
          if (item.current > 0) {
            item.current -= 1;
          }
        }
        return item;
      });

      res.status(200).json({
        message: `Player removed from game session '${session}' in ${region}`,
      });
    } catch (error) {
      let err = error as Error;
      logger.error(err.message, "GameServer");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get("/check/user/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(404).json({ message: "User does not exist." });
      }

      res.json({ message: "User Already Exists." });
    } catch (error) {
      let err = error as Error;
      logger.error(
        `Error checking if user exists: ${err.message}`,
        "GameServer"
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/eon/vbucks/:accountId/:value", async (req, res) => {
    try {
      let foundStatus: string = "NotFound";
      const { accountId, value } = req.params;

      if (accountId && value) {
        const userToUpdate = await Account.findOne({ accountId });

        if (userToUpdate) {
          const updatedUser = await Account.updateOne(
            {
              accountId,
            },
            {
              vbucks: userToUpdate.vbucks + parseInt(value),
            }
          );

          if (updatedUser.modifiedCount > 0) {
            foundStatus = "foundAndUpdated";
          }
        }
      }
    } catch (error) {
      let err = error as Error;
      logger.error(err.message, "GameServer");
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
