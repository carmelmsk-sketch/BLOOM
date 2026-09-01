import { pgTable, text, timestamp, uuid, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name"),
    avatar: text("avatar"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ([
    index("users_email_idx").on(table.email),
  ])
);

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  profile: one(creatorProfilesTable),
  onboarding: one(onboardingTable),
  products: many(productsTable),
  activities: many(activitiesTable),
}));

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

// API Response Types
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  avatar: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserResponse = z.infer<typeof UserSchema>;

export const UserCreateRequestSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  displayName: z.string().min(2, "Le nom d'affichage doit contenir au moins 2 caractères"),
});

export type UserCreateRequest = z.infer<typeof UserCreateRequestSchema>;

export const UserLoginRequestSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type UserLoginRequest = z.infer<typeof UserLoginRequestSchema>;
