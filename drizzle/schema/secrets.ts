import { sql } from 'drizzle-orm';
import { int, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-valibot';
import { projects } from './projects';

export const secrets = table('secrets', {
  id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  value: text('value'),
  description: text('description'),
  project_id: int('project_id', { mode: 'number' }).references(() => projects.id),
  current_calls: int('current_calls', { mode: 'number' }).default(0),
  max_calls: int('max_calls', { mode: 'number' }),
  expires_at: text('expires_at'),
  last_used_at: text('last_used_at'),
  created_at: text('created_at').default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  updated_at: text('updated_at').default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

export type Secret = typeof secrets.$inferSelect;
export type CreateSecret = typeof secrets.$inferInsert;

export const secretSelectSchema = createSelectSchema(secrets);
export const createSecretSchema = createInsertSchema(secrets);
export const updateSecretSchema = createUpdateSchema(secrets);
