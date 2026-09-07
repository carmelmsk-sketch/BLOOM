import { relations } from 'drizzle-orm';
import { usersTable } from './users';
import { creatorProfilesTable } from './creator-profile';
import { onboardingTable } from './onboarding';
import { productsTable } from './products';
import { activitiesTable } from './activities';

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  profile: one(creatorProfilesTable, {
    fields: [usersTable.id],
    references: [creatorProfilesTable.userId],
  }),
  onboarding: one(onboardingTable, {
    fields: [usersTable.id],
    references: [onboardingTable.userId],
  }),
  products: many(productsTable),
  activities: many(activitiesTable),
}));
