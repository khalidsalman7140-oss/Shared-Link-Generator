import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const deepServiceRequests = pgTable("deep_service_requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  userEmail: varchar("user_email", { length: 255 }),
  userName: varchar("user_name", { length: 255 }),
  category: varchar("category", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  budget: varchar("budget", { length: 100 }),
  deadline: varchar("deadline", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  adminNotes: text("admin_notes"),
  priority: varchar("priority", { length: 30 }).default("normal"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
