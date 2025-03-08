import { cleanEnv, str } from "envalid";

export const env = cleanEnv(process.env, {
  BING_API_KEY: str(),
  SESSION_SECRET: str(),
});
