import { pgTable, text, timestamp, uuid, foreignKey, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./users";
import { z } from "zod";

export const productsTable = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    type: text("type").notNull(), // ebook, formation, pack, template, guide, autre
    price: numeric("price", { precision: 10, scale: 2 }),
    published: text("published").default("false"),
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

export const productsRelations = relations(productsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [productsTable.userId],
    references: [usersTable.id],
  }),
}));

export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = typeof productsTable.$inferInsert;
