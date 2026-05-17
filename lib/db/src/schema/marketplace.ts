import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const marketplaceProfiles = pgTable("marketplace_profiles", {
  id:            serial("id").primaryKey(),
  userId:        text("user_id").notNull().unique(),
  userEmail:     text("user_email"),
  userName:      text("user_name"),
  businessName:  text("business_name").notNull(),
  category:      text("category").notNull(),
  tagline:       text("tagline"),
  description:   text("description").notNull(),
  skills:        text("skills"),
  whatsapp:      text("whatsapp"),
  telegram:      text("telegram"),
  location:      text("location"),
  portfolio:     text("portfolio"),
  isPublic:      boolean("is_public").default(true).notNull(),
  viewCount:     integer("view_count").default(0).notNull(),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  updatedAt:     timestamp("updated_at").defaultNow().notNull(),
});

export const escrowTransactions = pgTable("escrow_transactions", {
  id:                 serial("id").primaryKey(),
  initiatorId:        text("initiator_id").notNull(),
  initiatorEmail:     text("initiator_email"),
  counterpartyName:   text("counterparty_name").notNull(),
  counterpartyContact:text("counterparty_contact").notNull(),
  amount:             text("amount").notNull(),
  currency:           text("currency").default("YER").notNull(),
  description:        text("description").notNull(),
  status:             text("status").default("pending").notNull(),
  adminNotes:         text("admin_notes"),
  createdAt:          timestamp("created_at").defaultNow().notNull(),
  updatedAt:          timestamp("updated_at").defaultNow().notNull(),
});
