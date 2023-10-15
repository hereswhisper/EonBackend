import { Router } from "express";
import logger from "../utils/logger";
import { sendErrorResponse } from "./oauth";

export default function initRoute(router: Router): void {
  router.get("/content/api/pages/fortnite-game", (req, res) => {
    try {
      let season: number | undefined;
      const useragent = req.headers["user-agent"];

      if (useragent) {
        const useragentParts = useragent.split("-");
        if (useragentParts.length > 1) {
          const seasonString = useragentParts[1].split(".")[0];
          season = seasonString === "Cert" ? 2 : parseInt(seasonString);
        }
      }

      const contentResponse = {
        "jcr:isCheckedOut": true,
        _title: "Fortnite Game",
        "jcr:baseVersion": "a7ca237317f1e7883b3279-c38f-4aa7-a325-e099e4bf71e5",
        _activeDate: "2017-08-30T03:20:48.050Z",
        lastModified: new Date(),
        _locale: "en-US",
        battleroyalenews: {
          news: {
            _type: "Battle Royale News",
            motds: [
              {
                image:
                  "https://www.solidbackgrounds.com/images/1920x1080/1920x1080-black-solid-color-background.jpg",
                titleImage:
                  "https://www.solidbackgrounds.com/images/1920x1080/1920x1080-black-solid-color-background.jpg",
                hidden: false,
                tabTitleOverride: "Eon",
                _type: "CommonUI Simple Message MOTD",
                title: "Eon",
                body: "Welcome to Eon Beta, if you run into any bugs please report them in the discord!",
                id: "Eon",
                spotlight: false,
              },
            ],
          },
          _title: "battleroyalenews",
          header: "",
          _noIndex: false,
          alwaysShow: false,
          style: "SpecialEvent",
          _activeDate: "2023-09-30T10:00:00.000Z",
          lastModified: new Date().toISOString(),
          _locale: "en-US",
        },
        battleroyalenewsv2: {
          news: {
            motds: [
              {
                entryType: "Text",
                image:
                  "https://images-ext-2.discordapp.net/external/c9cfmnis5pOz_jWs-0OJ-rdsoJ13HuZdSrwajVlXqE0/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1128047913008898188/c4892206752bd84187c2be4903a6e761.png",
                tileImage: "Eon",
                hidden: false,
                videoMute: false,
                tabTitleOverride: "Eon",
                _type: "CommonUI Simple Message MOTD",
                title: "Eon Beta Release",
                body: "if you run into bugs please report them in the discord!",
                videoLoop: false,
                videoStreamingEnabled: false,
                sortingPriority: 0,
                id: `EonNews`,
                spotlight: false,
              },
            ],
          },
        },
        emergencynotice: {
          news: {
            platform_messages: [],
            _type: "Battle Royale News",
            messages: [
              {
                hidden: false,
                _type: "CommonUI Simple Message Base",
                subgame: "br",
                title: "Welcome to Eon",
                body: "If you encounter any bugs, please report them on Discord!",
                spotlight: true,
              },
            ],
          },
          _title: "emergencynotice",
          _activeDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          _locale: "en-US",
        },
        emergencynoticev2: {
          news: {
            platform_messages: [],
            _type: "Battle Royale News",
            messages: [
              {
                hidden: false,
                _type: "CommonUI Simple Message Base",
                subgame: "br",
                title: "Welcome to Eon",
                body: "If you encounter any bugs, please report them on Discord!",
                spotlight: true,
              },
            ],
          },
          _title: "emergencynotice",
          _activeDate: new Date(),
          lastModified: new Date(),
          _locale: "en-US",
        },
        dynamicbackgrounds: {
          backgrounds: {
            backgrounds: [
              {
                stage: `season${season}`,
                _type: "DynamicBackground",
                key: "lobby",
              },
            ],
            _type: "DynamicBackgroundList",
          },
          _title: "dynamicbackgrounds",
          _noIndex: false,
          _activeDate: "2023-05-02T07:30:00.000Z",
          lastModified: "2023-05-02T13:51:18.036Z",
          _locale: "en-US",
          _templateName: "FortniteGameDynamicBackgrounds",
        },
        battlepasspurchase: {
          battlePassPurchaseDisclaimer:
            "Purchases of the Battle Pass are not eligible for returns through Fortnite Cancel Purchase or Return Tickets. Chapter 4 - Season 3 through August 25 2:00am ET. 1 Discount bundle per season. Max 100 Level purchases, up to level 200. Unspent Battle Stars will automatically be exchanged for unclaimed Battle Pass rewards at the end of the season.",
          battlePassPurchaseBackgroundURL:
            "https://cdn2.unrealengine.com/25-upsell-purchase-1920x1080-8495c7c12da5.jpg",
          battlePassTileImages: {
            nextTileImageURL:
              "https://cdn2.unrealengine.com/subs-styx-bptile--1024x1024-391c74013226.png",
            tileImageURL:
              "https://cdn2.unrealengine.com/subs-styx-bptile--1024x1024-391c74013226.png",
            _type: "Crew Global Image",
          },
          battlePassScreenDisclaimer:
            "Purchases of the Battle Pass are not eligible for returns through Fortnite Cancel Purchase or Return Tickets. Chapter 4 - Season 3 through August 25 2:00am ET",
          battlePassPurchaseLevelDisclaimer:
            "100 total levels can be purchased up to level 200 (season max 200). Purchases of the Battle Pass, Battle Stars, Levels, and Rewards are not eligible for returns through Fortnite Cancel Purchase or Return Tickets. Chapter 4 - Season 3 through August 25 2:00am ET. Discount bundle 1 per season. Levels purchase only to 100 total in season. Unspent Battle Stars will automatically be exchanged for unclaimed Battle Pass rewards at the end of the season.",
          _title: "BattlePassPurchase",
          battlePassPurchaseConfirmBackgroundURL:
            "https://cdn2.unrealengine.com/25-upsell-confirmation-1920x1080-c5a7625747f3.jpg",
          battlePassPurchaseDescription:
            "Level Up and Claim rewards! Looking for the Battle Bundle? Add 25 levels to your Battle Pass at any time!",
          _noIndex: false,
          _activeDate: "2023-06-09T08:00:00.000Z",
          lastModified: "2023-06-02T14:58:11.109Z",
          _locale: "en-US",
          _templateName: "BattlePassPurchaseTemplate",
        },
        tournamentinformation: {
          conversion_config: {
            containerName: "tournament_info",
            _type: "Conversion Config",
            enableReferences: true,
            contentName: "tournaments",
          },
          tournament_info: {
            tournaments: [
              {
                title_color: "FFFFFF",
                loading_screen_image:
                  "https://media.discordapp.net/attachments/1115557323105124372/1159613432350384189/image.png",
                background_text_color: "161616",
                background_right_color: "FF730C",
                poster_back_image:
                  "https://media.discordapp.net/attachments/1115557323105124372/1159613432350384189/image.png",
                _type: "Tournament Display Info",
                pin_earned_text: "Winner!",
                tournament_display_id: "s12_eon_duovbucks",
                highlight_color: "F7FF00",
                schedule_info: "By Skies and Bren",
                primary_color: "FFFFFF",
                flavor_description:
                  "Saddle up alone and compete with a new teammate each game for bragging rights!",
                poster_front_image:
                  "https://media.discordapp.net/attachments/1115557323105124372/1159613432350384189/image.png",
                short_format_title: "Duos Tournament",
                title_line_2: "Test",
                title_line_1: "Eon Duo Vbucks Cup",
                shadow_color: "161616",
                details_description:
                  "Compete for bragging rights & vbucks in this shorter format tournament. Each game you will queue up as a solo and be paired with a matchmade teammate! Players must be at least 13 years old (or such other age, if greater, as may be required in their country of residence), have MFA enabled and an account level of 15 or greater. For more details see: https://www.epicgames.com/fortnite/competitive/rules-library",
                background_left_color: "BC3900",
                long_format_title: "Eon Duo Vbucks Cup",
                poster_fade_color: "D73D14",
                secondary_color: "161616",
                playlist_tile_image:
                  "https://media.discordapp.net/attachments/1115557323105124372/1159613432350384189/image.png",
                base_color: "FFFFFF",
              },
            ],
            _type: "Tournaments Info",
          },
          _title: "tournamentinformation",
          _noIndex: false,
          _activeDate: "2018-11-13T22:32:47.734Z",
          lastModified: "2021-04-06T17:26:47.948Z",
          _locale: "en-US",
          _templateName: "FortniteGameTournamentInfo",
        },
      };

      return res.json(contentResponse);
    } catch (error) {
      let err = error as Error;
      logger.error(err.message, "Content");
      sendErrorResponse(
        res,
        "ServerError",
        "An error occurred while retrieving Fortnite game content."
      );
    }
  });
}
