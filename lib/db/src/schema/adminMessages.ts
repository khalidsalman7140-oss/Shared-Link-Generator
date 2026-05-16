import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const adminMessages = pgTable("admin_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email"),
  userName: text("user_name"),
  content: text("content").notNull(),
  direction: text("direction").notNull().default("user_to_admin"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AdminMessage = typeof adminMessages.$inferSelect;
