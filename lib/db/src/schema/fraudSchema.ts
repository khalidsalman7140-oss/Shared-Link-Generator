import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const emailFingerprints = pgTable("email_fingerprints", {
  id: serial("id").primaryKey(),
  emailHash: text("email_hash").notNull().unique(),
  userId: text("user_id"),
  usedTrialAt: timestamp("used_trial_at", { withTimezone: true }).defaultNow().notNull(),
  deleteCount: integer("delete_count").notNull().default(0),
  isBlocked: boolean("is_blocked").notNull().default(false),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
});

export type EmailFingerprint = typeof emailFingerprints.$inferSelect;
