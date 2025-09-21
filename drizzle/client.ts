// client.ts
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from './schema/index';

type Env = {
  DB?: D1Database;
  [key: string]: any;
};

// lazy-loaded better-sqlite3
let localDbInstance: any = null;

export async function getDB(env?: Env) {
  if (env && env.DB) {
    return drizzleD1(env.DB, { schema });
  }

  if (process.env.NODE_ENV !== 'production') {
    if (!localDbInstance) {
      const { default: Database } = await import('better-sqlite3');
      const { drizzle: drizzleSQLite } = await import('drizzle-orm/better-sqlite3');
      try {
        localDbInstance = new Database('./drizzle/db/db.sqlite');
      } catch {
        console.warn('Could not open db.sqlite, using in-memory database instead');
        localDbInstance = new Database(':memory:');
      }
      return drizzleSQLite(localDbInstance, { schema });
    }
    return localDbInstance;
  }

  throw new Error('better-sqlite3 is not available in production. Please use D1.');
}
