import path from "path";
import { defineConfig, devices } from "@playwright/test";

const jwtSecret =
  process.env.JWT_SECRET && process.env.JWT_SECRET !== "change-me-in-local-env"
    ? process.env.JWT_SECRET
    : "ci-e2e-secret-value";

const apiUrl = "http://localhost:3011";
const webUrl = "http://localhost:3010";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: webUrl, ...devices["Desktop Chrome"] },
  webServer: [
    {
      command: "npm run start:dev -w @legal-ai/api",
      cwd: path.join(__dirname, "../.."),
      url: `${apiUrl}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: "3011",
        WEB_ORIGIN: webUrl,
        AI_PROVIDER: "mock",
        VECTOR_STORE: "memory",
        EMBEDDING_DIMENSIONS: "64",
        SIMILARITY_THRESHOLD: "0.15",
        JWT_SECRET: jwtSecret,
      },
    },
    {
      command: "npm run dev -- --port 3010",
      url: webUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: apiUrl,
        NEXT_DIST_DIR: ".next-e2e",
      },
    },
  ],
});
