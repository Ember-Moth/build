import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './drizzle/index.ts',
  out: './drizzle/migrations/',
  dbCredentials: {
    url: './drizzle/db/db.sqlite',
  },
});
