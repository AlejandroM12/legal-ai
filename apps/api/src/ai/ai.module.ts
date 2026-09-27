import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CHAT_PROVIDER, EMBEDDING_PROVIDER } from './ai.tokens';
import { MockAiProvider } from './mock-ai.provider';
import { OllamaProvider } from './ollama.provider';

@Module({
  providers: [
    MockAiProvider,
    OllamaProvider,
    {
      provide: EMBEDDING_PROVIDER,
      inject: [ConfigService, MockAiProvider, OllamaProvider],
      useFactory: (
        config: ConfigService,
        mock: MockAiProvider,
        ollama: OllamaProvider,
      ) => (config.get('AI_PROVIDER') === 'mock' ? mock : ollama),
    },
    {
      provide: CHAT_PROVIDER,
      inject: [ConfigService, MockAiProvider, OllamaProvider],
      useFactory: (
        config: ConfigService,
        mock: MockAiProvider,
        ollama: OllamaProvider,
      ) => (config.get('AI_PROVIDER') === 'mock' ? mock : ollama),
    },
  ],
  exports: [EMBEDDING_PROVIDER, CHAT_PROVIDER],
})
export class AiModule {}
