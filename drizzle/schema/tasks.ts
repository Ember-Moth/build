import { sql } from 'drizzle-orm';
import { int, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-valibot';
import { projects } from './projects';

export const tasks = table('tasks', {
  id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  project_id: int('project_id', { mode: 'number' }).references(() => projects.id),
  run_id: int('run_id', { mode: 'number' }).notNull(),
  status: text('status').notNull(),
  created_at: text('created_at').default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  updated_at: text('updated_at').default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

export type Task = typeof tasks.$inferSelect;
export type CreateTask = typeof tasks.$inferInsert;

export const taskSelectSchema = createSelectSchema(tasks);
export const createTaskSchema = createInsertSchema(tasks);
export const updateTaskSchema = createUpdateSchema(tasks);
