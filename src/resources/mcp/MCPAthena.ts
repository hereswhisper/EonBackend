import fs from "fs";
import Account, { IAccount } from "../../database/models/Account";
import logger from "../../utils/logger";
import User from "../../database/models/User";

export default async function MCPAthena(
  accountId: string,
  profileId: string,
  client: boolean,
  season: number | string,
  rvn: any = 0
) {
  try {
    const Athena = await Account.findOne({ accountId })
      .lean()
      .catch((e) => {
        throw e;
      });

    const user = await User.findOne({ accountId })
      .lean()
      .catch((e) => {
        throw e;
      });

    if (!Athena || !user) {
      const emptyResponse = {};
      return emptyResponse;
    }

    if (Athena.Season === undefined) {
      await Account.updateOne(
        { accountId },
        {
          Season: [
            {
              season: 12,
              book_level: 1,
              book_xp: 0,
              book_purchased: false,
            },
          ],
        }
      );
      const updatedAthena = await Account.findOne({ accountId })
        .lean()
        .catch((e) => {
          throw e;
        });
      if (updatedAthena) {
        Athena.Season = updatedAthena.Season;
      }
    }

    if (Athena.stats === undefined) {
      await Account.updateOne(
        { accountId },
        {
          stats: {
            solos: {
              wins: 0,
              kills: 0,
              matchplayed: 0,
            },
            duos: {
              wins: 0,
              kills: 0,
              matchplayed: 0,
            },
            squad: {
              wins: 0,
              kills: 0,
              matchplayed: 0,
            },
            ltm: {
              wins: 0,
              kills: 0,
              matchplayed: 0,
            },
          },
        }
      );
      const updatedAthena = await Account.findOne({ accountId })
        .lean()
        .catch((e) => {
          throw e;
        });
      if (updatedAthena) {
        Athena.stats = updatedAthena.stats;
      }
    }

    if (Athena.BaseRevision === undefined) {
      await Account.updateOne(
        { accountId },
        { BaseRevision: Athena.profilerevision - 1 }
      );
      const updatedAthena = await Account.findOne({ accountId })
        .lean()
        .catch((e) => {
          throw e;
        });
      if (updatedAthena) {
        Athena.BaseRevision = updatedAthena.BaseRevision;
      }
    }

    let level = 1;
    let PurchaseBattlePass = false;
    let XP = 0;
    const selectedSeason = 12;

    if (selectedSeason === season) {
      Athena.Season.forEach((e: any) => {
        if (e.season === selectedSeason) {
          level = e.book_level;
          PurchaseBattlePass = e.book_purchased;
          XP = e.book_xp;
        }
      });
    }

    const profileRevision = Athena.profilerevision + 1;

    if (Athena) {
      const AthenaData = {
        profileRevision: Athena.profilerevision || 0,
        profileId,
        profileChangesBaseRevision: rvn || 0,
        profileChanges: [
          {
            changeType: "fullProfileUpdate",
            _id: "RANDOM",
            profile: {
              _id: "RANDOM",
              Update: "",
              Created: "2021-03-07T16:33:28.462Z",
              updated: "2021-05-20T14:57:29.907Z",
              rvn,
              wipeNumber: 1,
              accountId: Athena.accountId,
              profileId,
              version: "no_version",
              items: {
                sandbox_loadout: {
                  templateId: "CosmeticLocker:cosmeticlocker_athena",
                  attributes: {
                    locker_slots_data: {
                      slots: {
                        MusicPack: {
                          items: [Athena.musicpack.items],
                        },
                        Character: {
                          items: [Athena.character.items],
                          activeVariants: Athena.character.activeVariants,
                        },
                        Backpack: {
                          items: [Athena.backpack.items],
                          activeVariants: [Athena.backpack.activeVariants],
                        },
                        SkyDiveContrail: {
                          items: [Athena.skydivecontrail.items],
                          activeVariants: [
                            Athena.skydivecontrail.activeVariants,
                          ],
                        },
                        Dance: {
                          items: Athena.dance.items,
                        },
                        LoadingScreen: {
                          items: [Athena.loadingscreen.items],
                        },
                        Pickaxe: {
                          items: [Athena.pickaxe.items],
                          activeVariants: [Athena.pickaxe.activeVariants],
                        },
                        Glider: {
                          items: [Athena.glider.items],
                          activeVariants: [Athena.glider.activeVariants],
                        },
                        ItemWrap: {
                          items: Athena.itemwrap.items,
                          activeVariants: [Athena.itemwrap.activeVariants],
                        },
                      },
                    },
                    use_count: 0,
                    banner_icon_template: Athena.banner.banner_icon,
                    banner_color_template: Athena.banner.banner_color,
                    locker_name: "",
                    item_seen: false,
                    favorite: false,
                  },
                  quantity: 1,
                },
                loadout_1: {
                  templateId: "CosmeticLocker:cosmeticlocker_athena",
                  attributes: {
                    locker_slots_data: {
                      slots: {
                        MusicPack: {
                          items: [Athena.musicpack.items],
                        },
                        Character: {
                          items: [Athena.character.items],
                          activeVariants: Athena.character.activeVariants,
                        },
                        Backpack: {
                          items: [Athena.backpack.items],
                          activeVariants: [Athena.backpack.activeVariants],
                        },
                        SkyDiveContrail: {
                          items: [Athena.skydivecontrail.items],
                          activeVariants: [
                            Athena.skydivecontrail.activeVariants,
                          ],
                        },
                        Dance: {
                          items: Athena.dance.items,
                        },
                        LoadingScreen: {
                          items: [Athena.loadingscreen.items],
                        },
                        Pickaxe: {
                          items: [Athena.pickaxe.items],
                          activeVariants: [Athena.pickaxe.activeVariants],
                        },
                        Glider: {
                          items: [Athena.glider.items],
                          activeVariants: [Athena.glider.activeVariants],
                        },
                        ItemWrap: {
                          items: Athena.itemwrap.items,
                          activeVariants: [Athena.itemwrap.activeVariants],
                        },
                      },
                    },
                    use_count: 0,
                    banner_icon_template: Athena.banner.banner_icon,
                    banner_color_template: Athena.banner.banner_color,
                    locker_name: "Eon",
                    item_seen: false,
                    favorite: false,
                  },
                  quantity: 1,
                },
                "AthenaPickaxe:DefaultPickaxe": {
                  attributes: {
                    favorite: false,
                    item_seen: true,
                    level: 0,
                    max_level_bonus: 0,
                    rnd_sel_cnt: 0,
                    variants: [],
                    xp: 0,
                  },
                  templateId: "AthenaPickaxe:DefaultPickaxe",
                },
                "AthenaGlider:DefaultGlider": {
                  attributes: {
                    favorite: false,
                    item_seen: true,
                    level: 0,
                    max_level_bonus: 0,
                    rnd_sel_cnt: 0,
                    variants: [],
                    xp: 0,
                  },
                  templateId: "AthenaGlider:DefaultGlider",
                },
                "AthenaDance:EID_DanceMoves": {
                  attributes: {
                    favorite: false,
                    item_seen: true,
                    level: 0,
                    max_level_bonus: 0,
                    rnd_sel_cnt: 0,
                    variants: [],
                    xp: 0,
                  },
                  templateId: "AthenaDance:EID_DanceMoves",
                },
                "fae65ea8-b98e-4d1b-9d3b-8b7d156ab081": {
                  templateId: "MedalsPunchCard:dailypunchcard",
                  attributes: {
                    days_since_season_start_grant: 1,
                    punch_count: 10,
                    medal_punch_list: [
                      "Accolades:accoladeid_056_searchchests_silver_rumble",
                      "Accolades:accoladeid_066_elimination_gold_rumble",
                      "Accolades:accoladeid_031_teamscore_bronze",
                      "Accolades:accoladeid_firstmatchofday",
                      "Accolades:accoladeid_056_searchchests_silver_rumble",
                      "Accolades:accoladeid_060_elimination_gold_rumble",
                      "Accolades:accoladeid_062_assistplayer_silver_rumble",
                      "Accolades:accoladeid_060 elimination_gold_rumble",
                      "Accolades:accoladeid_055_searchchests_bronze_rumble",
                      "Accolades:accoladeid_062_assistplayer_silver_rumble",
                    ],
                  },
                  quantity: 1,
                },
              },
              stats: {
                attributes: {
                  use_random_loadout: false,
                  past_seasons: [],
                  season_match_boost: 0,
                  loadouts: ["sandbox_loadout", "loadout_1"],
                  mfa_reward_claimed: true,
                  rested_xp_overflow: 0,
                  current_mtx_platform: "Epic",
                  last_xp_interaction: "2022-12-10T22:14:37.647Z",
                  quest_manager: {
                    dailyLoginInterval: "0001-01-01T00:00:00.000Z",
                    dailyQuestRerolls: 1,
                  },
                  book_level: level,
                  season_num: 12,
                  book_xp: XP,
                  creative_dynamic_xp: {},
                  season: {
                    numWins: 0,
                    numHighBracket: 0,
                    numLowBracket: 0,
                  },
                  vote_data: {},
                  lifetime_wins: 0,
                  book_purchased: PurchaseBattlePass,
                  rested_xp_exchange: 1,
                  level,
                  rested_xp: 2500,
                  rested_xp_mult: 4.4,
                  accountLevel: 69,
                  rested_xp_cumulative: 52500,
                  xp: XP,
                  season_friend_match_boost: 0,
                  active_loadout_index: 0,
                  purchased_bp_offers: [],
                  last_match_end_datetime: "",
                  mtx_purchase_history_copy: [],
                  last_applied_loadout: "sandbox_loadout",
                  favorite_musicpack: Athena.musicpack.items,
                  banner_icon: Athena.banner.banner_icon,
                  favorite_itemwraps: Athena.itemwrap.items,
                  favorite_skydivecontrail: "",
                  favorite_pickaxe: Athena.pickaxe.items,
                  favorite_glider: Athena.glider.items,
                  favorite_backpack: Athena.backpack.items,
                  favorite_dance: Athena.dance.items,
                  favorite_loadingscreen: Athena.loadingscreen.items,
                  banner_color: Athena.banner.banner_color,
                },
              },
              commandRevision: 5,
            },
          },
        ],
        serverTime: new Date().toISOString(),
        profileCommandRevision: Athena.profilerevision || 0,
        responseVersion: 1,
      };

      fs.writeFileSync("./athena.json", JSON.stringify(AthenaData));

      const usersWithFullLocker = require("../usersWithFullLocker.json");
      let isEnabled = false;

      usersWithFullLocker.forEach((E: string) => {
        if (user.accountId === E) {
          isEnabled = true;
          const athena = require("../allCosmetics.json");
          AthenaData.profileChanges[0].profile.items = {
            ...AthenaData.profileChanges[0].profile.items,
            ...athena,
          };
        }
      });

      if (!isEnabled) {
        const athena = require("../athena.json");
        let enabled = false;

        AthenaData.profileChanges[0].profile.items = {
          ...AthenaData.profileChanges[0].profile.items,
          ...athena,
        };

        if (!Athena.items) {
          await Account.updateOne({ accountId }, { items: [] });
        } else {
          Athena.items.forEach((e: any) => {
            enabled = true;
          });
        }

        if (enabled) {
          Athena.items.forEach((e: any) => {
            AthenaData.profileChanges[0].profile.items = {
              ...AthenaData.profileChanges[0].profile.items,
              ...e,
            };
          });
        }

        if (client) {
          const defaultAthena = require("../defaultCosmetics.json");
          AthenaData.profileChanges[0].profile.items = {
            ...AthenaData.profileChanges[0].profile.items,
            ...defaultAthena,
          };
        }
      }

      return AthenaData;
    } else {
      const AthenaData = {
        errorCode: "errors.com.epicgames.page.not_found",
        message: "Looks Like That Isnt A Account Or The Account Is Deleted",
      };
      return AthenaData;
    }
  } catch (error) {
    let err = error as Error;
    logger.error(err.message, "MCPAthena");
    throw err;
  }
}
