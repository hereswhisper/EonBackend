import { Router } from "express";
import { WebhookClient, EmbedBuilder } from "discord.js";
import User, { IUser } from "../database/models/User";
import Account, { IAccount } from "../database/models/Account";
import { getEnv } from "../utils";
import logger from "../utils/logger";
import {
  ReportRequestBody,
  SubGameName,
} from "../resources/types/ReportRequestBody";

export default function initRoute(router: Router): void {
  router.post(
    "/fortnite/api/game/v2/toxicity/account/:accountId/report/:displayName",
    async (req, res) => {
      const webhook = new WebhookClient({ url: getEnv("WEBHOOK_URL") });

      try {
        const { accountId, displayName } = req.params;
        const token = req["headers"]["authorization"]?.split("Bearer ")[1];

        const user: IUser | null = await User.findOne({ accountId });
        const account: IAccount | null = await Account.findOne({ accountId });

        if (!user || !account || account.accessToken[0].token !== token) {
          return res.status(404).send({ error: "Not Found" });
        }

        const body: ReportRequestBody = req.body;

        if (body.subGameName === SubGameName.Athena) {
          const embed = new EmbedBuilder()
            .setTitle("A User has been Reported!")
            .addFields(
              {
                name: "Reason",
                value: body.reason || "Unknown - Please Resend",
              },
              {
                name: "Details",
                value: body.details || "Unknown - This isn't required",
              },
              {
                name: "Choosing To Report",
                value:
                  displayName || "Unknown - I bypassed because I don't care",
              },
              {
                name: "Game Id",
                value:
                  body.gameSessionId || "Unknown - Cannot Find Game Session ID",
              },
              {
                name: "Token",
                value: body.token || "Unknown - Cannot find token",
              }
            )
            .setFooter({
              text: `This report was sent by ${user.username || "Anonymous"}`,
            })
            .setColor(0x00ffff);

          webhook.send({
            username: "Reporter",
            embeds: [embed],
            avatarURL: "",
            content: "",
          });

          return res.status(203).send({});
        } else {
          res.status(403).send({});
        }
      } catch (error) {
        let err = error as Error;
        logger.error(`Error handling Report: ${err.message}`, "Reporting");
        return res.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
}
