export enum Modality {
  AUDIO = 'AUDIO',
  TEXT = 'TEXT'
}

export enum Type {
  OBJECT = 'OBJECT',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  ARRAY = 'ARRAY',
  BOOLEAN = 'BOOLEAN'
}

export interface FunctionDeclaration {
  name: string;
  description?: string;
  parameters?: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export interface LiveInlineData {
  mimeType?: string;
  data?: string;
}

export interface LiveServerMessage {
  serverContent?: {
    inputTranscription?: { text: string };
    outputTranscription?: { text: string };
    modelTurn?: {
      parts?: Array<{
        text?: string;
        inlineData?: LiveInlineData;
      }>;
    };
    interrupted?: boolean;
  };
  toolCall?: {
    functionCalls: Array<{
      id: string;
      name: string;
      args: Record<string, unknown>;
    }>;
  };
}
