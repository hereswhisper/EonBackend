import { Router } from "express";
import fs from "fs";
import path from "path";

export default function initRoute(router: Router): void {
  router.get("/fortnite/api/calendar/v1/timeline", (req, res) => {
    let season: number = 0;
    let useragent = req.headers["user-agent"] || "";
    const currentTime = new Date().toISOString();

    if (useragent) {
      try {
        season = parseInt(useragent.split("-")[1].split(".")[0], 10) || 2;
      } catch {
        season = 2;
      }
    } else {
      season = 2;
    }

    res.json({
      channels: {
        "standalone-store": {
          states: [
            {
              validFrom: "2019-05-21T18:36:38.383Z",
              activeEvents: [],
              state: {
                activePurchaseLimitingEventIds: [],
                storefront: {},
                rmtPromotionConfig: [],
                storeEnd: "0001-01-01T00:00:00.000Z",
              },
            },
          ],
          cacheExpire: currentTime,
        },
        "client-matchmaking": {
          states: [],
          cacheExpire: currentTime,
        },
        tk: {},
        "featured-islands": {},
        "community-votes": {},
        "client-events": {
          states: [
            {
              validFrom: "2019-05-21T18:36:38.383Z",
              activeEvents: [
                {
                  eventType: `EventFlag.LobbySeason${season}`,
                  activeUntil: "9999-12-31T23:59:59.999Z",
                  activeSince: "2019-12-31T23:59:59.999Z",
                },
              ],
              state: {
                activeStorefronts: [],
                eventNamedWeights: {},
                activeEvents: [],
                seasonNumber: season,
                seasonTemplateId: `AthenaSeason:athenaseason${season}`,
                matchXpBonusPoints: 0,
                eventPunchCardTemplateId: "",
                seasonBegin: "0000-12-31T23:59:59.999Z",
                seasonEnd: "9999-12-31T23:59:59.999Z",
                seasonDisplayedEnd: "9999-12-31T23:59:59.999Z",
                weeklyStoreEnd: currentTime,
                stwEventStoreEnd: "9999-12-31T23:59:59.999Z",
                stwWeeklyStoreEnd: "9999-12-31T23:59:59.999Z",
                sectionStoreEnds: {
                  Featured: currentTime,
                  Daily: currentTime,
                },
                dailyStoreEnd: currentTime,
              },
            },
          ],
          cacheExpire: currentTime,
        },
      },
      cacheIntervalMins: 15,
      currentTime,
    });
  });
}
