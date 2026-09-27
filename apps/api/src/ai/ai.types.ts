export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ChatResult {
  content: string;
  toolCalls: ToolCall[];
  promptTokens: number | null;
  completionTokens: number | null;
}

export interface EmbeddingProvider {
  readonly dimensions: number;
  embed(texts: string[]): Promise<number[][]>;
}

export interface ChatProvider {
  readonly model: string;
  chat(messages: ChatMessage[], tools?: ToolDefinition[]): Promise<ChatResult>;
}
