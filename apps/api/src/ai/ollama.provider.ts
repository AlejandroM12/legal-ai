import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChatMessage,
  ChatProvider,
  ChatResult,
  EmbeddingProvider,
  ToolCall,
  ToolDefinition,
} from './ai.types';

@Injectable()
export class OllamaProvider implements EmbeddingProvider, ChatProvider {
  private readonly logger = new Logger(OllamaProvider.name);
  readonly model: string;
  readonly dimensions: number;
  private readonly baseUrl: string;
  private readonly embeddingModel: string;

  constructor(config: ConfigService) {
    this.baseUrl = (
      config.get<string>('OLLAMA_BASE_URL') ?? 'http://localhost:11434'
    ).replace(/\/$/, '');
    this.model = config.get<string>('CHAT_MODEL') ?? 'llama3.1';
    this.embeddingModel =
      config.get<string>('EMBEDDING_MODEL') ?? 'nomic-embed-text';
    this.dimensions = Number(config.get('EMBEDDING_DIMENSIONS') ?? 768);
  }

  async embed(texts: string[]) {
    const response = await fetch(`${this.baseUrl}/api/embed`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: this.embeddingModel, input: texts }),
    });
    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Ollama embed ${response.status}: ${body}`);
      throw new Error('No se pudieron generar embeddings con Ollama');
    }
    const payload = (await response.json()) as { embeddings: number[][] };
    return payload.embeddings;
  }

  async chat(
    messages: ChatMessage[],
    tools?: ToolDefinition[],
  ): Promise<ChatResult> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: messages.map((message) => ({
          role: message.role === 'tool' ? 'tool' : message.role,
          content: message.content,
        })),
        tools: tools?.map((tool) => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })),
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Ollama chat ${response.status}: ${body}`);
      throw new Error('Ollama no pudo responder');
    }
    const payload = (await response.json()) as {
      message?: {
        content?: string;
        tool_calls?: Array<{
          function?: { name?: string; arguments?: Record<string, unknown> };
        }>;
      };
      prompt_eval_count?: number;
      eval_count?: number;
    };
    const toolCalls: ToolCall[] = (payload.message?.tool_calls ?? [])
      .map((call) => ({
        name: call.function?.name ?? '',
        arguments: call.function?.arguments ?? {},
      }))
      .filter((call) => call.name);
    return {
      content: payload.message?.content ?? '',
      toolCalls,
      promptTokens: payload.prompt_eval_count ?? null,
      completionTokens: payload.eval_count ?? null,
    };
  }
}
