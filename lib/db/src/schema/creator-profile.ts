import { pgTable, text, timestamp, uuid, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./users";
import { z } from "zod";

export const creatorProfilesTable = pgTable(
  "creator_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().unique(),
    username: text("username").unique(),
    bio: text("bio"),
    domain: text("domain"),
    objective: text("objective"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }).onDelete("cascade"),
  ]
);

export const creatorProfilesRelations = relations(creatorProfilesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [creatorProfilesTable.userId],
    references: [usersTable.id],
  }),
}));

export type CreatorProfile = typeof creatorProfilesTable.$inferSelect;
export type InsertCreatorProfile = typeof creatorProfilesTable.$inferInsert;

export const CreatorProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  username: z.string().nullable(),
  bio: z.string().nullable(),
  domain: z.string().nullable(),
  objective: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreatorProfileResponse = z.infer<typeof CreatorProfileSchema>;

export const CreatorProfileUpdateSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères").nullable().optional(),
  bio: z.string().nullable().optional(),
  domain: z.string().nullable().optional(),
  objective: z.string().nullable().optional(),
});

export type CreatorProfileUpdate = z.infer<typeof CreatorProfileUpdateSchema>;
