import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	real,
	text,
	timestamp,
	uniqueIndex,
	vector
} from 'drizzle-orm/pg-core';

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
	sources?: Array<{
		sourceId: string;
		short: string;
		url?: string;
		support: string;
		insightIds: string[];
	}>;
};

export type SavedInsightContentKind =
	| 'text'
	| 'image'
	| 'chart'
	| 'stat'
	| 'quote'
	| 'source'
	| 'dataset';

export type SavedInsightContentJson = {
	label?: string;
	description?: string;
	sourceId?: string;
	sourceIds?: string[];
	imageName?: string;
	alt?: string;
	caption?: string;
	credit?: string;
	chartType?: string;
	unit?: string;
	csv?: string;
	data?: unknown;
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
		contentKind: text('content_kind').$type<SavedInsightContentKind>().notNull().default('text'),
		contentJson: jsonb('content_json').$type<SavedInsightContentJson>(),
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

export const sourceDocument = pgTable(
	'source_document',
	{
		id: text('id').primaryKey(),
		sourceId: text('source_id').notNull(),
		explainerSlug: text('explainer_slug').notNull(),
		short: text('short').notNull(),
		full: text('full').notNull(),
		url: text('url'),
		year: integer('year').notNull(),
		contentHash: text('content_hash').notNull(),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp('updated_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('source_document_explainer_source_uidx').on(table.explainerSlug, table.sourceId),
		index('source_document_explainer_idx').on(table.explainerSlug)
	]
);

export const sourceChunk = pgTable(
	'source_chunk',
	{
		id: text('id').primaryKey(),
		sourceDocumentId: text('source_document_id')
			.notNull()
			.references(() => sourceDocument.id, { onDelete: 'cascade' }),
		sourceId: text('source_id').notNull(),
		explainerSlug: text('explainer_slug').notNull(),
		chapterId: text('chapter_id'),
		stepId: text('step_id'),
		chunkKind: text('chunk_kind').notNull(),
		chunkText: text('chunk_text').notNull(),
		url: text('url'),
		contentHash: text('content_hash').notNull(),
		embedding: vector('embedding', { dimensions: 1536 }),
		embeddingModel: text('embedding_model'),
		embeddedAt: timestamp('embedded_at'),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp('updated_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('source_chunk_content_hash_uidx').on(table.contentHash),
		index('source_chunk_explainer_idx').on(table.explainerSlug),
		index('source_chunk_source_document_idx').on(table.sourceDocumentId),
		index('source_chunk_context_idx').on(table.explainerSlug, table.chapterId, table.stepId)
	]
);

export const savedInsightSourceMatch = pgTable(
	'saved_insight_source_match',
	{
		id: text('id').primaryKey(),
		savedInsightId: text('saved_insight_id')
			.notNull()
			.references(() => savedInsight.id, { onDelete: 'cascade' }),
		sourceChunkId: text('source_chunk_id')
			.notNull()
			.references(() => sourceChunk.id, { onDelete: 'cascade' }),
		sourceDocumentId: text('source_document_id')
			.notNull()
			.references(() => sourceDocument.id, { onDelete: 'cascade' }),
		score: real('score').notNull(),
		matchReason: text('match_reason').notNull(),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('saved_insight_source_match_uidx').on(table.savedInsightId, table.sourceChunkId),
		index('saved_insight_source_match_insight_idx').on(table.savedInsightId),
		index('saved_insight_source_match_source_idx').on(table.sourceDocumentId)
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
		insightIds: jsonb('insight_ids').$type<string[]>().notNull().default([]),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(table) => [
		index('insight_summary_user_created_idx').on(table.userId, table.createdAt),
		index('insight_summary_user_explainer_idx').on(table.userId, table.explainerSlug)
	]
);

export const insightSummarySource = pgTable(
	'insight_summary_source',
	{
		id: text('id').primaryKey(),
		summaryId: text('summary_id')
			.notNull()
			.references(() => insightSummary.id, { onDelete: 'cascade' }),
		sourceChunkId: text('source_chunk_id')
			.notNull()
			.references(() => sourceChunk.id, { onDelete: 'cascade' }),
		sourceDocumentId: text('source_document_id')
			.notNull()
			.references(() => sourceDocument.id, { onDelete: 'cascade' }),
		score: real('score').notNull(),
		createdAt: timestamp('created_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('insight_summary_source_uidx').on(table.summaryId, table.sourceChunkId),
		index('insight_summary_source_summary_idx').on(table.summaryId),
		index('insight_summary_source_source_idx').on(table.sourceDocumentId)
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

export const aiUsageReset = pgTable(
	'ai_usage_reset',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		weekStart: timestamp('week_start').notNull(),
		resetAt: timestamp('reset_at')
			.$defaultFn(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('ai_usage_reset_user_week_uidx').on(table.userId, table.weekStart),
		index('ai_usage_reset_user_idx').on(table.userId)
	]
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	savedInsights: many(savedInsight),
	insightSummaries: many(insightSummary),
	insightEmailDeliveries: many(insightEmailDelivery),
	aiUsageResets: many(aiUsageReset)
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

export const savedInsightRelations = relations(savedInsight, ({ one, many }) => ({
	user: one(user, {
		fields: [savedInsight.userId],
		references: [user.id]
	}),
	sourceMatches: many(savedInsightSourceMatch)
}));

export const insightSummaryRelations = relations(insightSummary, ({ one, many }) => ({
	user: one(user, {
		fields: [insightSummary.userId],
		references: [user.id]
	}),
	emailDeliveries: many(insightEmailDelivery),
	sources: many(insightSummarySource)
}));

export const aiUsageResetRelations = relations(aiUsageReset, ({ one }) => ({
	user: one(user, {
		fields: [aiUsageReset.userId],
		references: [user.id]
	})
}));

export const sourceDocumentRelations = relations(sourceDocument, ({ many }) => ({
	chunks: many(sourceChunk),
	savedInsightMatches: many(savedInsightSourceMatch),
	summarySources: many(insightSummarySource)
}));

export const sourceChunkRelations = relations(sourceChunk, ({ one, many }) => ({
	document: one(sourceDocument, {
		fields: [sourceChunk.sourceDocumentId],
		references: [sourceDocument.id]
	}),
	savedInsightMatches: many(savedInsightSourceMatch),
	summarySources: many(insightSummarySource)
}));

export const savedInsightSourceMatchRelations = relations(savedInsightSourceMatch, ({ one }) => ({
	insight: one(savedInsight, {
		fields: [savedInsightSourceMatch.savedInsightId],
		references: [savedInsight.id]
	}),
	chunk: one(sourceChunk, {
		fields: [savedInsightSourceMatch.sourceChunkId],
		references: [sourceChunk.id]
	}),
	document: one(sourceDocument, {
		fields: [savedInsightSourceMatch.sourceDocumentId],
		references: [sourceDocument.id]
	})
}));

export const insightSummarySourceRelations = relations(insightSummarySource, ({ one }) => ({
	summary: one(insightSummary, {
		fields: [insightSummarySource.summaryId],
		references: [insightSummary.id]
	}),
	chunk: one(sourceChunk, {
		fields: [insightSummarySource.sourceChunkId],
		references: [sourceChunk.id]
	}),
	document: one(sourceDocument, {
		fields: [insightSummarySource.sourceDocumentId],
		references: [sourceDocument.id]
	})
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
