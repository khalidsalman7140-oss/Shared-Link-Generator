import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  userEmail: text("user_email"),
  userName: text("user_name"),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  service: text("service"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  userEmail: text("user_email"),
  reason: text("reason"),
  blockedAt: timestamp("blocked_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentRequests = pgTable("payment_requests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email"),
  userName: text("user_name"),
  planRequested: text("plan_requested").notNull(),
  receiptImage: text("receipt_image"),
  transferNumber: text("transfer_number"),
  amount: text("amount"),
  transferService: text("transfer_service"),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type AppSetting = typeof appSettings.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
