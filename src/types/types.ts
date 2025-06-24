export interface Character {
  id: string;
  name: string;
  tagline: string;
  description: string;
  greeting: string;
  definition: string;
  image: string;
  tags: {
    genre: string[];
    rating: string[];
    character: string[];
    source: string[];
  };
}

export interface Message {
  id: string;
  type: 'user' | 'character';
  content: string;
  timestamp: Date;
  characterId?: string;
}

export interface ChatSettings {
  model: 'pygmalion' | 'mythomax' | 'nous-hermes' | 'mistral';
  temperature: number;
  maxTokens: number;
  userPersona?: string;
}

export interface UserPersona {
  id: string;
  name: string;
  description: string;
  traits: string[];
}

export interface AskRequest {
  question: string;
  character_id: string;
  user_id: string;
  style: string;
  user_persona: string;
  model: string;
}

export interface AskResponse {
  answer: string;
}

export interface ResetRequest {
  user_id: string;
  character_id: string;
}

