import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const PLANS = ["free", "weekly", "monthly", "annual", "enterprise"] as const;
export type Plan = (typeof PLANS)[number];

export const FREE_DAILY_LIMIT = 5;
export const PLAN_LIMITS: Record<Plan, number> = {
  free: FREE_DAILY_LIMIT,
  weekly: Infinity,
  monthly: Infinity,
  annual: Infinity,
  enterprise: Infinity,
};

export const userPlans = pgTable("user_plans", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  plan: text("plan").notNull().default("free"),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userUsage = pgTable("user_usage", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  messageCount: integer("message_count").notNull().default(0),
});

export const insertUserPlanSchema = createInsertSchema(userPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserPlan = typeof userPlans.$inferSelect;
export type UserUsage = typeof userUsage.$inferSelect;
export type InsertUserPlan = z.infer<typeof insertUserPlanSchema>;
