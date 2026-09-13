// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
export {};
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * A paid assessment entitlement. Phase 1 only defines the durable contract;
 * later phases will connect these records to the assessment and merchant tools.
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
  createdBy: text("created_by").notNull().default("merchant"),
});

export type AssessmentAccess = typeof assessmentAccess.$inferSelect;
export type NewAssessmentAccess = typeof assessmentAccess.$inferInsert;
