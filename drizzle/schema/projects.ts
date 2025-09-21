import { sql } from 'drizzle-orm';
import { int, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-valibot';
import { workflows } from './workflows';

export type DeployMethod = {
  type: string;
  name: string;
  description: string;
  runs_on: string;
  branch: string;
  commands: string[];
  outputs: string[];
  compress: boolean;
};

export type Environment = {
  name: string;
  description: string;
};

export type Pricing = {
  monthly?: number;
  yearly?: number;
  per_use?: number;
};

export type PaymentConfig = {
  cryptomus?: {
    api_key?: string;
    merchant_id?: string;
  };
};

export const projects = table('projects', {
  id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  repo_owner: text('repo_owner'),
  repo_name: text('repo_name'),
  preview: text('preview'),
  workflow_id: int('workflow_id', { mode: 'number' }).references(() => workflows.id),
  deploy_methods: text('deploy_methods'),
  environment: text('environment'),
  pricing: text('pricing'),
  payment_config: text('payment_config'),
  created_at: text('created_at').default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  updated_at: text('updated_at').default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

export type Project = typeof projects.$inferSelect;
export type CreateProject = typeof projects.$inferInsert;

export const projectSelectSchema = createSelectSchema(projects);
export const createProjectSchema = createInsertSchema(projects);
export const updateProjectSchema = createUpdateSchema(projects);
