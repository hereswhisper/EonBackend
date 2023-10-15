import Account, { IAccount } from "../../database/models/Account";
import User from "../../database/models/User";
import logger from "../../utils/logger";

export async function EquipBattleRoyaleCustomization(
  accountId: string,
  profileId: string,
  slotName: string,
  itemToSlot: string,
  indexWithinSlot: string,
  variantUpdates: string,
  rvn: number
) {
  try {
    const account: IAccount | null = await Account.findOne({
      accountId,
    }).lean();
    const category = slotName;

    if (!account) {
      return {};
    }

    await Account.updateOne(
      { accountId },
      { [`profilerevision`]: account.profilerevision + 1 }
    );

    if (category === "ItemWrap" || category === "Dance") {
      // Debug log
      console.log(category);

      if (itemToSlot == "") {
        await Account.updateOne(
          { accountId },
          { [`${category.toString().toLowerCase()}`]: `` }
        );
      } else {
        await Account.findOne(
          { accountId },
          {
            [`${category
              .toString()
              .toLowerCase()}.items.${indexWithinSlot}`]: `${
              itemToSlot.split(":")[0]
            }:${itemToSlot.split(":")[1]}`,
          }
        );
      }
    } else {
      if (itemToSlot === "") {
        await Account.updateOne(
          { accountId },
          { [`${category.toString().toLowerCase()}.items`]: `` }
        );
      } else {
        await Account.updateOne(
          { accountId },
          {
            [`${category.toString().toLowerCase()}.items`]: `${
              itemToSlot.split(":")[0]
            }:${itemToSlot.split(":")[1].toLowerCase()}`,
          }
        );
      }
    }

    // Debug log
    console.log(variantUpdates);

    if (variantUpdates.length != 0) {
      await Account.updateOne(
        { accountId },
        {
          [`${category.toString().toLowerCase()}.activeVariants`]:
            variantUpdates,
        }
      );
    }

    const newAccountProfile = await Account.findOne({ accountId }).lean();

    // Debug log
    console.log(rvn);

    if (!newAccountProfile) {
      return {};
    }

    const responseData = {
      profileRevision: newAccountProfile.profilerevision,
      profileId: "athena",
      profileChangesBaseRevision: newAccountProfile.profilerevision,
      profileChanges: [
        {
          changeType: "statModified",
          name: `favorite_${category.toLowerCase()}`,
          value: itemToSlot,
        },
      ],
      profileCommandRevision: newAccountProfile.profilerevision,
      serverTime: new Date(),
      responseVersion: 2,
    };

    return responseData;
  } catch (error) {
    let err = error as Error;
    logger.error(err.message, "MCPEquipBattleRoyaleCustomization");
  }
}

export async function SetCosmeticLockerSlot(
  accountId: string,
  profileId: string,
  slotName: string,
  itemToSlot: string,
  slotIndex: number,
  variantUpdates: string[],
  rvn: number
) {
  try {
    const account = await Account.findOne({ accountId }).lean();
    const user = await User.findOne({ accountId }).lean();

    if (!account) {
      return {};
    }

    if (!user) {
      return {};
    }

    await Account.updateOne(
      { accountId },
      { $set: { profilerevision: account.profilerevision + 1 } }
    );
    await Account.updateOne(
      { accountId },
      { $set: { BaseRevision: account.BaseRevision + 1 } }
    );

    if (slotName === "ItemWrap" || slotName === "Dance") {
      if (slotIndex === -1) {
        if (slotName === "Dance") {
          return logger.error("Error Found", "SetCosmeticLockerSlot");
        }
      } else {
        if (itemToSlot === "") {
          await Account.updateOne(
            { accountId },
            { $set: { [`${slotName.toLowerCase()}.items.${slotIndex}`]: "" } }
          );
        } else {
          await Account.updateOne(
            { accountId },
            {
              $set: {
                [`${slotName.toLowerCase()}.items.${slotIndex}`]: `${
                  itemToSlot.split(":")[0]
                }:${itemToSlot.split(":")[1].toLowerCase()}`,
              },
            }
          );
        }
      }
    } else {
      if (itemToSlot === "") {
        await Account.updateOne(
          { accountId },
          { $set: { [`${slotName.toLowerCase()}.items`]: "" } }
        );
      } else {
        await Account.updateOne(
          { accountId },
          {
            $set: {
              [`${slotName.toLowerCase()}.items`]: `${
                itemToSlot.split(":")[0]
              }:${itemToSlot.split(":")[1].toLowerCase()}`,
            },
          }
        );
      }
    }
    let updatedProfile: any[] = [
      {
        changeType: "statModified",
        name: `favorite_${slotName.toLowerCase()}`,
        value: itemToSlot,
      },
    ];

    const newAccountData = await Account.findOne({ accountId }).lean();

    if (!newAccountData) {
      return {};
    }

    const response = {
      profileId: "athena",
      profileChangesBaseRevision: rvn,
      profileChanges: updatedProfile,
      profileCommandRevision: newAccountData.profilerevision,
      serverTime: new Date().toISOString(),
      responseVersion: 1,
    };

    return response;
  } catch (error) {
    let err = error as Error;
    logger.error(err.message, "MCPEquipBattleRoyaleCustomization");
  }
}
