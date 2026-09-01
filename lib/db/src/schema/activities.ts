import { pgTable, text, timestamp, uuid, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./users";
import { z } from "zod";

export const activitiesTable = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    type: text("type").notNull(), // creation, learning, action
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }).onDelete("cascade"),
  ]
);

export const activitiesRelations = relations(activitiesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [activitiesTable.userId],
    references: [usersTable.id],
  }),
}));

export type Activity = typeof activitiesTable.$inferSelect;
export type InsertActivity = typeof activitiesTable.$inferInsert;
