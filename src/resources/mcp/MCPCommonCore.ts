import Account from "../../database/models/Account";
import fs from "fs";
import logger from "../../utils/logger";

export default async function MCPCommonCore(
  accountId: string,
  profileId: string,
  simple?: boolean
) {
  try {
    let account = await Account.findOne({ accountId }).lean().exec();

    if (!account) {
      return {};
    }

    if (!account.BaseRevision) {
      await Account.updateOne(
        { accountId },
        { BaseRevision: account.profilerevision - 1 }
      );
      account = await Account.findOne({ accountId }).lean().exec();
    }

    if (account) {
      const commonCoreData: any = {
        profileRevision: account.profilerevision || 0,
        profileId,
        profileChangesBaseRevision: account.BaseRevision || 0,
        profileChanges: [
          {
            changeType: "fullProfileUpdate",
            _id: "RANDOM",
            profile: {
              _id: "RANDOM",
              Update: "",
              Created: "2021-03-07T16:33:28.462Z",
              updated: new Date().toISOString(),
              rvn: 0,
              wipeNumber: 1,
              accountId: "",
              profileId,
              version: "no_version",
              items: {
                Currency: {
                  templateId: "Currency:MtxPurchased",
                  attributes: {
                    platform: "EpicPC",
                  },
                  quantity: account.vbucks,
                },
              },
              stats: {
                attributes: {
                  survey_data: {},
                  personal_offers: {},
                  intro_game_played: true,
                  import_friends_claimed: {},
                  mtx_affiliate: "",
                  undo_cooldowns: [],
                  mtx_affiliate_set_time: "",
                  mtx_purchase_history: {
                    refundsUsed: 3,
                    refundCredits: 0,
                    purchases: [],
                  },
                  inventory_limit_bonus: 0,
                  current_mtx_platform: "EpicPC",
                  weekly_purchases: {},
                  daily_purchases: {},
                  ban_history: {},
                  in_app_purchases: {},
                  permissions: [],
                  undo_timeout: "min",
                  monthly_purchases: {},
                  allowed_to_send_gifts: true,
                  mfa_enabled: true,
                  allowed_to_receive_gifts: true,
                  gift_history: {},
                },
              },
              commandRevision: 5,
            },
          },
        ],
        serverTime: new Date().toISOString(),
        profileCommandRevision: account.profilerevision,
        responseVersion: 1,
      };

      const commonCore = require("../common_core.json");
      commonCoreData.profileChanges[0].profile.items = {
        ...commonCoreData.profileChanges[0].profile.items,
        ...commonCore,
      };

      const purchasesData: any[] = [];

      account.items.forEach((e: any) => {
        const firstKey = Object.keys(e)[0];
        const templateId = e[firstKey].templateId;
        purchasesData.push({
          purchaseId: e[firstKey].templateId,
          offerId: `v2:/${e[firstKey].templateId}`,
          purchaseDate: "9999-12-31T00:00:00.000Z",
          freeRefundEligible: false,
          fulfillments: [],
          lootResult: [
            {
              itemType: e[firstKey].templateId,
              itemGuid: e[firstKey].templateId,
              itemProfile: "athena",
              quantity: 1,
            },
          ],
          totalMtxPaid: 0,
          metadata: {},
          gameContext: "",
        });
      });

      commonCoreData.profileChanges[0].profile.stats.attributes.mtx_purchase_history.purchases =
        purchasesData;

      if (simple) return commonCoreData.profileChanges[0].profile;
      return commonCoreData;
    }
  } catch (error) {
    let err = error as Error;
    logger.error(err.message, "MCPCommonCore");
  }
}
