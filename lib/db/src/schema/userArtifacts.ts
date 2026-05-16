import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const userArtifacts = pgTable("user_artifacts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email"),
  userName: text("user_name"),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  siteSlug: text("site_slug"),
  platform: text("platform"),
  request: text("request").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type UserArtifact = typeof userArtifacts.$inferSelect;
