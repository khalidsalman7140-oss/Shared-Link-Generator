import { pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

export const SERVICES = [
  "stability",
  "elevenlabs",
  "deepl",
  "claude",
  "runway",
  "luma",
] as const;
export type ServiceName = (typeof SERVICES)[number];

export const userApiKeys = pgTable(
  "user_api_keys",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    service: text("service").notNull(),
    encryptedKey: text("encrypted_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique("user_service_unique").on(t.userId, t.service)],
);

export type UserApiKey = typeof userApiKeys.$inferSelect;
