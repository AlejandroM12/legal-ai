import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { embedText } from './hash-embedding';
import {
  ChatMessage,
  ChatProvider,
  ChatResult,
  EmbeddingProvider,
  ToolDefinition,
} from './ai.types';

@Injectable()
export class MockAiProvider implements EmbeddingProvider, ChatProvider {
  readonly model: string;
  readonly dimensions: number;

  constructor(config: ConfigService) {
    this.model = config.get<string>('CHAT_MODEL') ?? 'mock';
    this.dimensions = Number(config.get('EMBEDDING_DIMENSIONS') ?? 64);
  }

  embed(texts: string[]) {
    return Promise.resolve(
      texts.map((text) => embedText(text, this.dimensions)),
    );
  }

  chat(messages: ChatMessage[], tools?: ToolDefinition[]): Promise<ChatResult> {
    const hasToolResult = messages.some((message) => message.role === 'tool');
    const userMessage = [...messages]
      .reverse()
      .find((message) => message.role === 'user');
    const question = userMessage?.content ?? '';

    if (
      tools?.some((tool) => tool.name === 'search_chunks') &&
      !hasToolResult
    ) {
      return Promise.resolve({
        content: '',
        toolCalls: [{ name: 'search_chunks', arguments: { query: question } }],
        promptTokens: null,
        completionTokens: null,
      });
    }

    const evidence = messages
      .filter((message) => message.role === 'tool' || message.role === 'user')
      .map((message) => message.content)
      .join('\n');
    if (evidence.includes('BEGIN EVIDENCE_')) {
      const used = [...evidence.matchAll(/BEGIN EVIDENCE_[0-9a-f]+ (\d+)/g)]
        .map((match) => Number(match[1]))
        .filter((index) => index > 0);
      const snippet = evidence.match(/El[\s\S]{0,180}/)?.[0]?.split('\n')[0] ?? '';
      const content = JSON.stringify(
        used.length && snippet
          ? { answer: snippet, used: [used[0]], abstained: false }
          : { answer: 'El documento no lo indica.', used: [], abstained: true },
      );
      return Promise.resolve({
        content,
        toolCalls: [],
        promptTokens: question.length,
        completionTokens: content.length,
      });
    }
    const grounded =
      evidence.match(/El[\s\S]{0,240}/)?.[0] ??
      'No hay evidencia suficiente en los documentos.';
    return Promise.resolve({
      content: grounded,
      toolCalls: [],
      promptTokens: question.length,
      completionTokens: grounded.length,
    });
  }
}
