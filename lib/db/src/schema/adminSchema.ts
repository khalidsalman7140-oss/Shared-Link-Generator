import { pgTable, serial, text, timestamp, integer, boolean, decimal, json } from "drizzle-orm/pg-core";

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

export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  sponsor: text("sponsor").notNull().default("مركز الأسطورة"),
  position: text("position").notNull().default("banner"),
  isActive: boolean("is_active").notNull().default(true),
  clickCount: integer("click_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  userEmail: text("user_email"),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const serviceBookings = pgTable("service_bookings", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  userEmail: text("user_email"),
  userName: text("user_name"),
  phone: text("phone").notNull(),
  serviceType: text("service_type").notNull(),
  serviceTitle: text("service_title").notNull(),
  description: text("description").notNull(),
  budget: text("budget"),
  urgency: text("urgency").notNull().default("normal"),
  status: text("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const publishedSites = pgTable("published_sites", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  userId: text("user_id").notNull(),
  title: text("title"),
  htmlContent: text("html_content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  endpoint: text("endpoint").notNull().unique(),
  keys: json("keys").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type AppSetting = typeof appSettings.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Ad = typeof ads.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type ServiceBooking = typeof serviceBookings.$inferSelect;
export type PublishedSite = typeof publishedSites.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
