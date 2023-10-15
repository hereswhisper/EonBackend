export interface Quest {
  itemGuid: string;
  challenge_bundle_id?: string;
  objectives: { name: string; count: number }[];
}

export interface AccountItem {
  [x: string]: {
    templateId: string;
    attributes: {
      creation_time: string;
      level: number;
      item_seen: boolean;
      playlists: any[];
      sent_new_notification: boolean;
      challenge_bundle_id: string;
      xp_reward_scalar: number;
      challenge_linked_quest_given: string;
      quest_pool: string;
      quest_state: string;
      bucket: string;
      last_state_change_time: string;
      challenge_linked_quest_parent: string;
      max_level_bonus: number;
      xp: number;
      quest_rarity: string;
      favorite: boolean;
      [key: string]: any;
    };
    quantity: number;
  };
}

export const quest: Quest[] = [];
