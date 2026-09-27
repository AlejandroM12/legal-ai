import { AppController } from './app.controller';
import { describe, expect, it } from '@jest/globals';

describe('AppController', () => {
  it('reports health', () => {
    expect(new AppController().health()).toEqual({
      ok: true,
      service: 'legal-ai-api',
    });
  });
});
