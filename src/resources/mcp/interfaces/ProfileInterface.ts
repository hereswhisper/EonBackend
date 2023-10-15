export interface IProfile {
  rvn: number;
  accountId: string;
  profileId: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  // ill make a ubterface for attributes later I can't be asked.
  items: {
    [key: string]: { templateId: string; attributes: any; quantity: number };
  };
  stats: { templateId?: string; attributes: any };
  commandRevision: number;
}
