export enum SubGameName {
  Athena = "Athena",
}

export interface ReportRequestBody {
  subGameName: SubGameName;
  reason?: string;
  details?: string;
  gameSessionId?: string;
  token?: string;
  playlistName?: string;
  bIsCompetitiveEvent?: boolean;
  reporterPlatform?: string;
  offenderPlatform?: string;
}
