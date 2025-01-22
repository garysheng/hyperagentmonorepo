export interface TwitterTokens {
  access_token: string
  refresh_token?: string
}

export interface TwitterUserMinimal {
  id: string;
  username: string;
  tokens?: TwitterTokens;
}

interface BaseDMEventV2 {
  id: string;
  created_at?: string;
  dm_conversation_id?: string;
  sender_id?: string;
}

interface MessageCreateDMEventV2 extends BaseDMEventV2 {
  event_type: 'MessageCreate';
  text?: string;
  attachments?: {
    media_keys?: string[];
  };
  referenced_tweets?: {
    id: string;
    type: 'replied_to' | 'quoted' | 'retweeted';
  }[];
}

interface ParticipantsEventV2 extends BaseDMEventV2 {
  event_type: 'ParticipantsJoin' | 'ParticipantsLeave';
  participant_ids?: string[];
}

export type DMEventV2 = MessageCreateDMEventV2 | ParticipantsEventV2;

export interface TwitterDM {
  id: string;
  event_type: 'MessageCreate';
  text: string;
  created_at: string;
  dm_conversation_id: string;
  sender_id: string;
  sender: TwitterUserMinimal;
  recipient: TwitterUserMinimal;
  attachments?: {
    media_keys?: string[];
  };
  referenced_tweets?: {
    id: string;
    type: 'replied_to' | 'quoted' | 'retweeted';
  }[];
}

export interface TwitterAuthState {
  isAuthenticated: boolean;
  user?: TwitterUserMinimal;
  error?: string;
} 