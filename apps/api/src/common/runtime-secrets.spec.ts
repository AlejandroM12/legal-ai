import { describe, expect, it } from '@jest/globals';
import { assertRuntimeSecrets } from './runtime-secrets';

describe('assertRuntimeSecrets', () => {
  it('rejects the example JWT secret', () => {
    expect(() =>
      assertRuntimeSecrets({ JWT_SECRET: 'change-me-in-local-env' }),
    ).toThrow('JWT_SECRET');
    expect(() => assertRuntimeSecrets({})).toThrow('JWT_SECRET');
  });

  it('requires a Qdrant key in production', () => {
    expect(() =>
      assertRuntimeSecrets({ JWT_SECRET: 'local-secret-value', NODE_ENV: 'production' }),
    ).toThrow('QDRANT_API_KEY');
    expect(() =>
      assertRuntimeSecrets({
        JWT_SECRET: 'local-secret-value',
        NODE_ENV: 'production',
        QDRANT_API_KEY: 'qdrant-key',
      }),
    ).not.toThrow();
  });
});
