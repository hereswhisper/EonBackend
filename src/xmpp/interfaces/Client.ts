export interface Client {
  client: any;
  accountId: string;
  displayName: string;
  token: string;
  jid: string;
  sender?: string;
  resource: string;
  lastPresenceUpdate: {
    away: boolean;
    status: string;
  };
}
