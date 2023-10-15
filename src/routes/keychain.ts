import { Router } from "express";
import logger from "../utils/logger";

export default function initRoute(router: Router): void {
  router.get("/fortnite/api/storefront/v2/keychain", (req, res) => {
    try {
      //   const cachedData = memoryCache.get(
      //     "/fortnite/api/storefront/v2/keychain"
      //   );

      //   if (cachedData) res.status(200).json(cachedData);
      //   else {
      //     const keychainData = require("../resources/storefront/keychain.json");

      //     memoryCache.put(
      //       "/fortnite/api/storefront/v2/keychain",
      //       keychainData,
      //       60000
      //     );
      //     res.status(200).json(keychainData);
      //   }
      res.status(200).json(require("../resources/storefront/keychain.json"));
    } catch (error) {
      let err = error as Error;
      logger.error(err.message, "Keychain");
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
}
