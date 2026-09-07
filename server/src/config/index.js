import 'dotenv/config';

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const isTest = env === 'test';

function numberFromEnv(name, fallback) {
  const value = Number.parseInt(process.env[name] || String(fallback), 10);
  return Number.isFinite(value) ? value : fallback;
}

const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  env,
  isProduction,
  isTest,
  port: numberFromEnv('PORT', 5000),
  // Tests must never use the developer's configured Atlas database.
  mongoUri: isTest ? process.env.TEST_MONGODB_URI || '' : process.env.MONGODB_URI || '',
  clientOrigins,
  bcryptCost: numberFromEnv('BCRYPT_COST', 12),
  storage: {
    maxFileMb: numberFromEnv('MAX_FILE_MB', 10),
    uploadDir: process.env.UPLOAD_DIR || '',
  },
  ai: {
    provider: (process.env.AI_PROVIDER || 'mock').toLowerCase(),
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    baseUrl: process.env.AI_BASE_URL || '',
    maxTokens: numberFromEnv('AI_MAX_TOKENS', 1200),
    timeoutMs: numberFromEnv('AI_TIMEOUT', 30000),
  },
  jwt: {
    accessSecret: process.env.JWT_SECRET || (isTest ? 'test-access-secret' : 'dev-access-secret-change-me'),
    refreshSecret: process.env.JWT_REFRESH_SECRET || (isTest ? 'test-refresh-secret' : 'dev-refresh-secret-change-me'),
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtlDays: numberFromEnv('JWT_REFRESH_TTL_DAYS', 7),
  },
};
