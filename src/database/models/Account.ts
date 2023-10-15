import { Schema, model, Document, Types } from "mongoose";

export interface IAccount extends Document {
  accountId: string;
  character: CharacterInfo;
  backpack: CharacterInfo;
  skydivecontrail: CharacterInfo;
  dance: CharacterInfo;
  loadingscreen: CharacterInfo;
  musicpack: CharacterInfo;
  pickaxe: CharacterInfo;
  glider: CharacterInfo;
  itemwrap: CharacterInfo;
  banner: BannerInfo;
  items: any | any[];
  vbucks: number;
  gifts: any | any[];
  banned: boolean;
  allowsGifts: boolean;
  optOutOfPublicLeaderboards: boolean;
  refundsUsed: number;
  refundCredits: number;
  accessToken: any;
  refreshToken: any;
  clientToken: any;
  stats: {
    solos: StatsInfo;
    duos: StatsInfo;
    squad: StatsInfo;
    ltm: StatsInfo;
  };
  Season: SeasonInfo[] | any;
  profilerevision: number;
  BaseRevision: number;
  RVN: number;
}

interface CharacterInfo {
  items: string;
  activeVariants: any[];
}

interface BannerInfo {
  banner_icon: string;
  banner_color: string;
}

interface StatsInfo {
  wins: number;
  kills: number;
  matchplayed: number;
}

interface SeasonInfo {
  season: number;
  book_level: number;
  book_xp: number;
  book_purchased: boolean;
}

const AccountSchema = new Schema<IAccount>({
  accountId: {
    type: String,
    required: true,
  },
  character: {
    items: {
      type: String,
      default: "",
    },
    activeVariants: {
      type: Array,
      default: [],
    },
  },
  backpack: {
    items: {
      type: String,
      default: "",
    },
    activeVariants: {
      type: Array,
      default: [],
    },
  },
  skydivecontrail: {
    items: {
      type: String,
      default: "",
    },
    activeVariants: {
      type: Array,
      default: [],
    },
  },
  dance: {
    items: {
      type: Array,
      default: ["", "", "", "", "", "", ""],
    },
    activeVariants: {
      type: Array,
      default: [],
    },
  },
  loadingscreen: {
    items: {
      type: String,
      default: "",
    },
    activeVariants: {
      type: Array,
      default: [],
    },
  },
  musicpack: {
    items: {
      type: String,
      default: "",
    },
    activeVariants: {
      type: Array,
      default: [],
    },
  },
  pickaxe: {
    items: {
      type: String,
      default: "",
    },
    activeVariants: {
      type: Array,
      default: [],
    },
  },
  glider: {
    items: {
      type: String,
      default: "",
    },
    activeVariants: {
      type: Array,
      default: [],
    },
  },
  itemwrap: {
    items: {
      type: Array,
      default: ["", "", "", "", "", "", ""],
    },
    activeVariants: {
      type: Array,
      default: [],
    },
  },
  banner: {
    banner_icon: {
      type: String,
      default: "BRSeason01",
    },
    banner_color: {
      type: String,
      default: "DefaultColor1",
    },
  },
  items: {
    type: Array,
    default: [],
  },
  vbucks: {
    type: Number,
    default: 2000,
  },
  gifts: {
    type: Array,
    default: [],
  },
  banned: {
    type: Boolean,
    default: false,
  },
  allowsGifts: {
    type: Boolean,
    default: true,
  },
  optOutOfPublicLeaderboards: {
    type: Boolean,
    default: false,
  },
  refundsUsed: {
    type: Number,
    default: 0,
  },
  refundCredits: {
    type: Number,
    default: 3,
  },
  accessToken: {
    type: Array,
    default: [],
  },
  refreshToken: {
    type: Array,
    default: [],
  },
  clientToken: {
    type: Array,
    default: [],
  },
  stats: {
    solos: createStatsSchema(),
    duos: createStatsSchema(),
    squad: createStatsSchema(),
    ltm: createStatsSchema(),
  },
  Season: {
    type: Array,
    default: [
      {
        season: 12,
        book_level: 1,
        book_xp: 0,
        book_purchased: false,
      },
    ],
  },
  profilerevision: {
    type: Number,
    default: 1,
  },
  BaseRevision: {
    type: Number,
    default: 0,
  },
  RVN: {
    type: Number,
    default: 1,
  },
});

export default model<IAccount>("Account", AccountSchema);

function createSchema(defaultValue?: any) {
  return {
    items: {
      type: String,
      default: defaultValue,
    },
    activeVariants: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  };
}

function createStatsSchema() {
  return {
    wins: {
      type: Number,
      default: 0,
    },
    kills: {
      type: Number,
      default: 0,
    },
    matchplayed: {
      type: Number,
      default: 0,
    },
  };
}
