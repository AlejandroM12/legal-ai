import { AppController } from './app.controller';

describe('AppController', () => {
  it('reports health', () => {
    expect(new AppController().health()).toEqual({
      ok: true,
      service: 'legal-ai-api',
    });
  });
});
