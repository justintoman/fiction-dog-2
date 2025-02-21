import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./app/db/schema.server.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: Bun.env.DB_FILE_NAME!,
  },
});
