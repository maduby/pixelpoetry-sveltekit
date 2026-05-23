import { relations } from 'drizzle-orm';
import { index, integer, jsonb, pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified')
		.$defaultFn(() => false)
		.notNull(),
	image: text('image'),
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').$defaultFn(() => new Date()),
	updatedAt: timestamp('updated_at').$defaultFn(() => new Date())
});

export type InsightSummaryJson = {
	title: string;
	overview: string;
	keyTakeaways: string[];
	memoryHooks: string[];
	shareableSummary: string;
	suggestedNextRead?: string;
};

export const savedInsight = pgTable(
	'saved_insight',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		explainerSlug: text('explainer_slug').notNull(),
		chapterId: text('chapter_id').notNull(),
		stepId: text('step_id').notNull(),
		selectedText: text('selected_text').notNull(),
		surroundingText: text('surrounding_text').notNull(),
		note: text('note'),
		selectionHash: text('selection_hash').notNull(),
		sourceHash: text('source_hash').notNull(),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp('updated_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(table) => [
		index('saved_insight_user_created_idx').on(table.userId, table.createdAt),
		index('saved_insight_user_explainer_idx').on(table.userId, table.explainerSlug)
	]
);

export const insightSummary = pgTable(
	'insight_summary',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		explainerSlug: text('explainer_slug').notNull(),
		summaryJson: jsonb('summary_json').$type<InsightSummaryJson>().notNull(),
		model: text('model').notNull(),
		provider: text('provider').notNull(),
		promptVersion: text('prompt_version').notNull(),
		inputHash: text('input_hash').notNull(),
		insightCount: integer('insight_count').notNull(),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(table) => [
		index('insight_summary_user_created_idx').on(table.userId, table.createdAt),
		index('insight_summary_user_explainer_idx').on(table.userId, table.explainerSlug)
	]
);

export const insightEmailDelivery = pgTable(
	'insight_email_delivery',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		summaryId: text('summary_id').references(() => insightSummary.id, { onDelete: 'set null' }),
		toEmail: text('to_email').notNull(),
		resendId: text('resend_id'),
		status: text('status').notNull(),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(table) => [
		index('insight_email_delivery_user_created_idx').on(table.userId, table.createdAt),
		index('insight_email_delivery_summary_idx').on(table.summaryId)
	]
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	savedInsights: many(savedInsight),
	insightSummaries: many(insightSummary),
	insightEmailDeliveries: many(insightEmailDelivery)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

export const savedInsightRelations = relations(savedInsight, ({ one }) => ({
	user: one(user, {
		fields: [savedInsight.userId],
		references: [user.id]
	})
}));

export const insightSummaryRelations = relations(insightSummary, ({ one, many }) => ({
	user: one(user, {
		fields: [insightSummary.userId],
		references: [user.id]
	}),
	emailDeliveries: many(insightEmailDelivery)
}));

export const insightEmailDeliveryRelations = relations(insightEmailDelivery, ({ one }) => ({
	user: one(user, {
		fields: [insightEmailDelivery.userId],
		references: [user.id]
	}),
	summary: one(insightSummary, {
		fields: [insightEmailDelivery.summaryId],
		references: [insightSummary.id]
	})
}));
