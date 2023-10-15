import { Router } from "express";
import logger from "../utils/logger";
import Account, { IAccount } from "../database/models/Account";

interface StatsInfo {
  wins: number;
}

interface Account {
  accountId: string;
  stats: {
    [key: string]: StatsInfo;
  };
}

interface LeaderboardEntry {
  account: string;
  value: number;
}

async function fetchAccountData(): Promise<Account[]> {
  const accounts: Account[] = (await Account.find().lean()) as Account[];
  return accounts;
}

function getLeaderboardEntries(
  accounts: Account[],
  mode: string
): LeaderboardEntry[] {
  return accounts
    .filter((account) => account.stats && account.stats[mode])
    .slice(0, 100)
    .map((account) => ({
      account: account.accountId,
      value: account.stats[mode].wins,
    }));
}

function handleServerError(res: any, error: Error): void {
  logger.error(error.message, "Leaderboard");
  res.status(500).json({ error: "Internal Server Error" });
}

interface StatsResponse {
  startTime: number;
  endTime: number;
  stats: {
    [key: string]: number;
  };
}

async function findAccountByAccountId(
  accountId: string
): Promise<IAccount | null> {
  return await Account.findOne({ accountId });
}

// Helper function to generate the stats object
function generateStats(account: IAccount): StatsResponse {
  return {
    startTime: 0,
    endTime: 9223372036854776000,
    stats: {
      br_score_keyboardmouse_m0_playlist_DefaultSolo: 0,
      br_kills_keyboardmouse_m0_playlist_DefaultSolo: account.stats.solos.kills,
      br_playersoutlived_keyboardmouse_m0_playlist_DefaultSolo: 0,
      br_matchesplayed_keyboardmouse_m0_playlist_DefaultSolo:
        account.stats.solos.matchplayed,
      br_placetop25_keyboardmouse_m0_playlist_DefaultSolo: 0,
      br_placetop1_keyboardmouse_m0_playlist_DefaultSolo:
        account.stats.solos.wins,
      br_score_keyboardmouse_m0_playlist_DefaultDuo: 0,
      br_kills_keyboardmouse_m0_playlist_DefaultDuo: account.stats.duos.kills,
      br_playersoutlived_keyboardmouse_m0_playlist_DefaultDuo: 0,
      br_matchesplayed_keyboardmouse_m0_playlist_DefaultDuo:
        account.stats.duos.matchplayed,
      br_placetop25_keyboardmouse_m0_playlist_DefaultDuo: 0,
      br_placetop1_keyboardmouse_m0_playlist_DefaultDuo:
        account.stats.duos.wins,
      br_score_keyboardmouse_m0_playlist_DefaultSquad: 0,
      br_kills_keyboardmouse_m0_playlist_DefaultSquad:
        account.stats.squad.kills,
      br_playersoutlived_keyboardmouse_m0_playlist_DefaultSquad: 0,
      br_matchesplayed_keyboardmouse_m0_playlist_DefaultSquad:
        account.stats.squad.matchplayed,
      br_placetop25_keyboardmouse_m0_playlist_DefaultSquad: 0,
      br_placetop1_keyboardmouse_m0_playlist_DefaultSquad:
        account.stats.squad.wins,
      br_score_keyboardmouse_m0_playlist_50v50: 0,
      br_kills_keyboardmouse_m0_playlist_50v50: account.stats.ltm.kills,
      br_playersoutlived_keyboardmouse_m0_playlist_50v50: 0,
      br_matchesplayed_keyboardmouse_m0_playlist_50v50:
        account.stats.ltm.matchplayed,
      br_placetop25_keyboardmouse_m0_playlist_50v50: 0,
      br_placetop1_keyboardmouse_m0_playlist_50v50: account.stats.ltm.wins,
    },
  };
}

export default function initRoute(router: Router): void {
  router.all(
    [
      "/fortnite/api/statsv2/account/:accountId",
      "/statsproxy/api/statsv2/account/:accountId",
    ],
    async (req, res) => {
      try {
        const account: IAccount | null = await findAccountByAccountId(
          req.params.accountId
        );

        if (account) {
          const stats = generateStats(account);

          res.json(stats);
        } else {
          res.json({ error: "Account not found" });
        }
      } catch (error) {
        handleServerError(res, error as Error);
      }
    }
  );

  router.all(
    [
      "/statsproxy/api/statsv2/leaderboards/:leaderboardType",
      "/fortnite/api/statsv2/leaderboards/:leaderboardType",
    ],
    async (req, res) => {
      try {
        const { leaderboardType } = req.params;

        // Define a map of leaderboardType values to game modes
        const leaderboardTypeToMode: { [key: string]: string } = {
          br_placetop1_keyboardmouse_m0_playlist_defaultduo: "duos",
          br_placetop1_keyboardmouse_m0_playlist_defaultsquad: "squad",
          default: "solos", // Default mode if no match is found
        };

        // Get the corresponding game mode or use the default
        const mode =
          leaderboardTypeToMode[leaderboardType] ||
          leaderboardTypeToMode.default;

        // Fetch account data
        const accounts = await fetchAccountData();

        // Filter and map the leaderboard entries
        const leaderboardEntries = getLeaderboardEntries(accounts, mode);

        res.json({
          entries: leaderboardEntries,
          maxSize: 1000,
        });
      } catch (error) {
        handleServerError(res, error as Error);
      }
    }
  );
}
