import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * A paid assessment entitlement with server-backed draft progress.
 * Final report locking and merchant tooling are deliberately deferred.
 */
export const assessmentAccess = sqliteTable("assessment_access", {
  id: text("id").primaryKey(),
  tokenHash: text("token_hash").notNull().unique(),
  status: text("status", {
    enum: ["unused", "in_progress", "completed", "revoked"],
  }).notNull().default("unused"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  firstOpenedAt: integer("first_opened_at", { mode: "timestamp_ms" }),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
  orderReference: text("order_reference"),
  merchantNote: text("merchant_note"),
  currentQuestion: integer("current_question").notNull().default(0),
  answersJson: text("answers_json").notNull().default("[]"),
  progressVersion: integer("progress_version").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  createdBy: text("created_by").notNull().default("merchant"),
});

export type AssessmentAccess = typeof assessmentAccess.$inferSelect;
export type NewAssessmentAccess = typeof assessmentAccess.$inferInsert;
