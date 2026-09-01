import { pgTable, text, timestamp, uuid, boolean, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./users";
import { z } from "zod";

export const onboardingTable = pgTable(
  "onboarding",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().unique(),
    step: text("step").notNull().default("welcome"), // welcome, profile, objective, done
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at"),
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

export const onboardingRelations = relations(onboardingTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [onboardingTable.userId],
    references: [usersTable.id],
  }),
}));

export type Onboarding = typeof onboardingTable.$inferSelect;
export type InsertOnboarding = typeof onboardingTable.$inferInsert;

export const OnboardingSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  step: z.enum(["welcome", "profile", "objective", "done"]),
  completed: z.boolean(),
  completedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type OnboardingResponse = z.infer<typeof OnboardingSchema>;
