import { Router } from "express";
import logger from "../utils/logger";
import catalog from "../resources/storefront/catalog.json";
import User from "../database/models/User";

export default function initRoute(router: Router): void {
  router.get("/fortnite/api/storefront/v2/catalog", (req, res) => {
    res.json(require("../resources/storefront/catalog.json"));
  });

  router.get(
    "/fortnite/api/storefront/v2/gift/check_eligibility/recipient/:friendId/:offerId",
    async (req, res) => {
      try {
        const offerId = decodeURI(req.params.offerId);

        let catalogEntry: any;
        for (const storefront of catalog.storefronts) {
          catalogEntry = storefront.catalogEntries.find(
            (entry) => entry.offerId === offerId
          );
          if (catalogEntry) break;
        }

        const isCatalogPurchaseFound = !!catalogEntry;

        return res.status(204).json({
          price: {
            currentType: "MtxCurrency",
            currencySubType: "",
            regularPrice: catalogEntry?.regularPrice,
            dynamicRegularPrice: catalogEntry?.dynamicRegularPrice,
            finalPrice: catalogEntry?.finalPrice,
            saleExpiraton: "9999-12-31T23:59:59.999Z",
            basePrice: catalogEntry?.basePrice,
          },
          items: catalogEntry?.itemGrants || [],
          isFound: isCatalogPurchaseFound,
        });
      } catch (error) {
        let err = error as Error;
        logger.error(`Catalog: ${err.message}`, "Catalog");
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  router.get("/catalog/api/shared/bulk/offers", (req, res) => {
    return res.status(204).json({});
  });
}
