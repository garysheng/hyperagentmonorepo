// Basic shared types
export type TypeOrArrayOf<T> = T | T[];

// DM Event Types
export type DMEventType = 'MessageCreate' | 'ParticipantsJoin' | 'ParticipantsLeave';

export type DMEventField = 
  | 'id' 
  | 'text' 
  | 'event_type' 
  | 'created_at' 
  | 'dm_conversation_id' 
  | 'sender_id' 
  | 'participant_ids' 
  | 'referenced_tweets' 
  | 'attachments';

export type DMEventExpansion = 
  | 'attachments.media_keys' 
  | 'referenced_tweets.id' 
  | 'sender_id' 
  | 'participant_ids';

// DM Event Interfaces
export interface DMEventAttachment {
  media_keys: string[];
}

export interface BaseDMEvent {
  id: string;
  created_at?: string;
  sender_id?: string;
  dm_conversation_id?: string;
  attachments?: DMEventAttachment;
  participant_ids?: string[];
}

export type DMEvent = 
  | ({
      event_type: 'MessageCreate';
      text: string;
    } & BaseDMEvent)
  | ({
      event_type: Extract<DMEventType, 'ParticipantsJoin' | 'ParticipantsLeave'>;
    } & BaseDMEvent);

// API Request/Response Types
export interface GetDMEventParams {
  'dm_event.fields'?: TypeOrArrayOf<DMEventField>;
  event_types?: TypeOrArrayOf<DMEventType>;
  expansions?: TypeOrArrayOf<DMEventExpansion>;
  max_results?: number;
  pagination_token?: string;
}

export interface PostDMParams {
  attachments?: Array<{ media_id: string }>;
  text?: string;
}

export interface CreateGroupDMParams {
  conversation_type: 'Group';
  participant_ids: string[];
  message: PostDMParams;
}

export interface DMResponse {
  dm_conversation_id: string;
  dm_event_id: string;
}

// OAuth Types
export interface TwitterTokens {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

export interface TwitterUser {
  id: string;
  username: string;
  name: string;
} 