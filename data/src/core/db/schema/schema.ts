import { pgTable, uuid, timestamp, text, jsonb, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const runStatusEnum = pgEnum('run_status', ['pending', 'running', 'completed', 'failed']);
export const jobStatusEnum = pgEnum('job_status', ['pending', 'running', 'completed', 'failed']);

// Tables
export const runs = pgTable('runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  startTime: timestamp('start_time').notNull().defaultNow(),
  schemaVersion: integer('schema_version').notNull().default(1),
  status: runStatusEnum('status').notNull().default('pending'),
  baselineId: uuid('baseline_id'),
  userId: uuid('user_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const screens = pgTable('screens', {
  runId: uuid('run_id')
    .notNull()
    .references(() => runs.id),
  screenId: uuid('screen_id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const actions = pgTable('actions', {
  actionId: uuid('action_id').primaryKey().defaultRandom(),
  screenId: uuid('screen_id')
    .notNull()
    .references(() => screens.screenId),
  type: text('type').notNull(),
  payload: jsonb('payload').notNull(),
  targetScreenId: uuid('target_screen_id').references(() => screens.screenId),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const baselines = pgTable('baselines', {
  baselineId: uuid('baseline_id').primaryKey().defaultRandom(),
  appId: text('app_id').notNull(),
  platform: text('platform').notNull(),
  version: text('version').notNull(),
  graphJson: jsonb('graph_json').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const jobs = pgTable('jobs', {
  jobId: uuid('job_id').primaryKey().defaultRandom(),
  runId: uuid('run_id')
    .notNull()
    .references(() => runs.id),
  packageName: text('package_name').notNull(),
  status: jobStatusEnum('status').notNull().default('pending'),
  enqueuedAt: timestamp('enqueued_at').notNull().defaultNow(),
  startedAt: timestamp('started_at'),
  finishedAt: timestamp('finished_at'),
  errorMessage: text('error_message'),
});

// app-launch-config schema moved to src/modules/app-launch-config/app-launch-config.schema.ts

// Relations
export const runsRelations = relations(runs, ({ many, one }) => ({
  screens: many(screens),
  jobs: many(jobs),
  baseline: one(baselines, {
    fields: [runs.baselineId],
    references: [baselines.baselineId],
  }),
}));

export const screensRelations = relations(screens, ({ one, many }) => ({
  run: one(runs, {
    fields: [screens.runId],
    references: [runs.id],
  }),
  actions: many(actions),
}));

export const actionsRelations = relations(actions, ({ one }) => ({
  screen: one(screens, {
    fields: [actions.screenId],
    references: [screens.screenId],
  }),
  targetScreen: one(screens, {
    fields: [actions.targetScreenId],
    references: [screens.screenId],
  }),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  run: one(runs, {
    fields: [jobs.runId],
    references: [runs.id],
  }),
}));

// app-launch-config relations moved with its schema
