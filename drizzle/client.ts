// @ts-ignore
let Database: any;
// @ts-ignore
let drizzleSQLite: any;
if (process.env.NODE_ENV !== 'production') {
  Database = require('better-sqlite3');
  drizzleSQLite = require('drizzle-orm/better-sqlite3').drizzle;
}
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from './schema/index';

type Env = {
  DB?: D1Database;
  [key: string]: any;
};
// @ts-ignore
let localDbInstance: any = null;

export function getDB(env?: Env) {
  if (env && env.DB) {
    return drizzleD1(env.DB, { schema });
  }
  if (process.env.NODE_ENV !== 'production') {
    if (!localDbInstance) {
      try {
        localDbInstance = new Database('./drizzle/db/db.sqlite');
      } catch (error) {
        console.warn('Could not open db.sqlite, using in-memory database instead');
        localDbInstance = new Database(':memory:');
      }
    }
    return drizzleSQLite(localDbInstance, { schema });
  }
  throw new Error('better-sqlite3 is not available in production. Please use D1.');
}