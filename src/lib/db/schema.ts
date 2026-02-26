import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  primaryKey,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// ----- Enums -----

export const submissionStatusEnum = pgEnum("submission_status", [
  "draft",
  "pre_registered",
  "results_submitted",
  "generating_paper",
  "paper_generated",
  "under_review",
  "revisions_requested",
  "accepted",
  "rejected",
  "published",
]);

export const studyTypeEnum = pgEnum("study_type", [
  "empirical",
  "simulation",
  "replication",
  "negative_results",
]);

export const reviewRecommendationEnum = pgEnum("review_recommendation", [
  "accept",
  "minor_revisions",
  "major_revisions",
  "reject",
]);

export const editorActionTypeEnum = pgEnum("editor_action_type", [
  "suggest_reviewers",
  "compile_reviews",
  "editorial_decision",
  "deadline_reminder",
  "consistency_check",
]);

// ----- Auth.js tables -----

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  expertise: jsonb("expertise").$type<string[]>(),
  bio: text("bio"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

// ----- Application tables -----

export const submissions = pgTable("submission", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  studyType: studyTypeEnum("study_type").notNull(),
  status: submissionStatusEnum("status").notNull().default("draft"),
  preRegistration: jsonb("pre_registration"),
  results: jsonb("results"),
  keywords: jsonb("keywords").$type<string[]>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const papers = pgTable("paper", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  content: jsonb("content").$type<{
    title: string;
    abstract: string;
    sections: { heading: string; body: string }[];
  }>(),
  markdown: text("markdown"),
  model: text("model"),
  citationValidations: jsonb("citation_validations"),
  generatedAt: timestamp("generated_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

export const reviews = pgTable("review", {
  id: uuid("id").defaultRandom().primaryKey(),
  paperId: uuid("paper_id")
    .notNull()
    .references(() => papers.id, { onDelete: "cascade" }),
  reviewerId: text("reviewer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scores: jsonb("scores").$type<{
    methodology: number;
    clarity: number;
    significance: number;
    reproducibility: number;
  }>(),
  sectionFeedback: jsonb("section_feedback").$type<
    { section: string; comment: string }[]
  >(),
  recommendation: reviewRecommendationEnum("recommendation"),
  summary: text("summary"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const editorActions = pgTable("editor_action", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  actionType: editorActionTypeEnum("action_type").notNull(),
  reasoning: text("reasoning"),
  data: jsonb("data"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const reviewerPerspectives = pgTable("reviewer_perspective", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  reviewerId: text("reviewer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const reviewerInvitations = pgTable("reviewer_invitation", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  reviewerId: text("reviewer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, accepted, declined
  invitedAt: timestamp("invited_at", { mode: "date" }).defaultNow().notNull(),
  respondedAt: timestamp("responded_at", { mode: "date" }),
});

// ----- Relations -----

export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(submissions),
  reviews: many(reviews),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  user: one(users, { fields: [submissions.userId], references: [users.id] }),
  papers: many(papers),
  editorActions: many(editorActions),
  reviewerInvitations: many(reviewerInvitations),
  reviewerPerspectives: many(reviewerPerspectives),
}));

export const papersRelations = relations(papers, ({ one, many }) => ({
  submission: one(submissions, {
    fields: [papers.submissionId],
    references: [submissions.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  paper: one(papers, { fields: [reviews.paperId], references: [papers.id] }),
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id] }),
}));

export const editorActionsRelations = relations(editorActions, ({ one }) => ({
  submission: one(submissions, {
    fields: [editorActions.submissionId],
    references: [submissions.id],
  }),
}));

export const reviewerInvitationsRelations = relations(
  reviewerInvitations,
  ({ one }) => ({
    submission: one(submissions, {
      fields: [reviewerInvitations.submissionId],
      references: [submissions.id],
    }),
    reviewer: one(users, {
      fields: [reviewerInvitations.reviewerId],
      references: [users.id],
    }),
  })
);

export const reviewerPerspectivesRelations = relations(
  reviewerPerspectives,
  ({ one }) => ({
    submission: one(submissions, {
      fields: [reviewerPerspectives.submissionId],
      references: [submissions.id],
    }),
    reviewer: one(users, {
      fields: [reviewerPerspectives.reviewerId],
      references: [users.id],
    }),
  })
);
