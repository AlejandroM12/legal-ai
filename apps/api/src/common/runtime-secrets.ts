const EXAMPLE_JWT_SECRET = 'change-me-in-local-env';

export function assertRuntimeSecrets(env: NodeJS.ProcessEnv = process.env) {
  const secret = env.JWT_SECRET;
  if (!secret || secret === EXAMPLE_JWT_SECRET) {
    throw new Error(
      'JWT_SECRET tiene que ser un valor propio. El de .env.example no firma tokens.',
    );
  }
  if (env.NODE_ENV === 'production' && !env.QDRANT_API_KEY) {
    throw new Error(
      'QDRANT_API_KEY es obligatorio cuando NODE_ENV es production.',
    );
  }
}
