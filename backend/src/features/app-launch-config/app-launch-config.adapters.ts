/**
 * @module features/app-launch-config/adapters
 * @description Adapters to map between :backend contracts and provider (:data) types.
 *              Commented scaffold to guide future migration.
 */

// import type { AppLaunchConfigDataPort } from './app-launch-config.port.js';
// import { db, appLaunchConfigs } from '@screengraph/data';
// import { eq } from 'drizzle-orm';

// export function makeAppLaunchConfigDataAdapter(): AppLaunchConfigDataPort {
//   return {
//     async getAll() {
//       return db.select().from(appLaunchConfigs);
//     },
//     async getById(id: string) {
//       const [row] = await db.select().from(appLaunchConfigs).where(eq(appLaunchConfigs.id, id));
//       return row ?? null;
//     },
//     async create(input: any) {
//       const [row] = await db.insert(appLaunchConfigs).values(input).returning();
//       return row;
//     },
//     async update(id: string, input: any) {
//       const [row] = await db.update(appLaunchConfigs).set(input).where(eq(appLaunchConfigs.id, id)).returning();
//       return row;
//     },
//     async remove(id: string) {
//       const res = await db.delete(appLaunchConfigs).where(eq(appLaunchConfigs.id, id));
//       return res.length > 0;
//     },
//     async getDefault() {
//       const [row] = await db.select().from(appLaunchConfigs).where(eq(appLaunchConfigs.isDefault, 'true'));
//       return row ?? null;
//     },
//     async setDefault(id: string) {
//       const [row] = await db.update(appLaunchConfigs).set({ isDefault: 'true' }).where(eq(appLaunchConfigs.id, id)).returning();
//       return row;
//     },
//   };
// }


