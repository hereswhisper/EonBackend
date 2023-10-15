import { Router } from "express";
import logger from "../utils/logger";
import User from "../database/models/User";

let Affiliates = [
  {
    name: "Skies",
  },
  {
    name: "Whisper",
  },
  {
    name: "Custox",
  },
  {
    name: "bren",
  },
  {
    name: "Glow",
  },
  {
    name: "GD",
    externalName: "TJ",
  },
];

export default function initRoute(router: Router): void {
  router.get(
    "/affiliate/api/public/affiliates/slug/:slug",
    async (req, res) => {
      const { slug } = req.params;
      const { cookie } = req.headers;

      try {
        const matchingAffiliate = Affiliates.find(
          (affiliate) => affiliate.name === slug
        );

        if (matchingAffiliate?.externalName === "TJ") {
          return Affiliates.find(
            (affiliate) => affiliate.externalName === slug
          );
        }

        if (matchingAffiliate) {
          if (cookie) {
            const account = await User.findOne({ username: slug });

            if (account) {
              await User.updateOne(
                { username: slug },
                {
                  $set: {
                    "profile.mtx_affiliate": matchingAffiliate.name,
                    "profile.mtx_affiliate_set_time": new Date().toISOString(),
                  },
                }
              );
              return res.json({
                id: matchingAffiliate.name || matchingAffiliate.externalName,
                slug: matchingAffiliate.name || matchingAffiliate.externalName,
                displayName:
                  matchingAffiliate.name || matchingAffiliate.externalName,
                status: "ACTIVE",
                verified: false,
              });
            } else {
              return res.json({});
            }
          }
        }
      } catch (error) {
        let err = error as Error;
        logger.error(`Affiliate: ${err.message}`, "Affiliate");
        return res.status(500).json({ error: "Internal Server Error" });
      }
      return res.json({});
    }
  );
}
