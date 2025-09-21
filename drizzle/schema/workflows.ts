import { sql } from 'drizzle-orm';
import { int, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-valibot';

export const workflows = table('workflows', {
  id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  repo_owner: text('repo_owner').notNull(),
  repo_name: text('repo_name').notNull(),
  workflow_file: text('workflow_file').notNull(),
  branch: text('branch').notNull(),
  github_token: text('github_token').notNull(),
  created_at: text('created_at').default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  updated_at: text('updated_at').default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

export type Workflow = typeof workflows.$inferSelect;
export type CreateWorkflow = typeof workflows.$inferInsert;

export const workflowSelectSchema = createSelectSchema(workflows);
export const createWorkflowSchema = createInsertSchema(workflows);
export const updateWorkflowSchema = createUpdateSchema(workflows);
