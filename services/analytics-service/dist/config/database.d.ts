import { PrismaClient } from '@prisma/client';
export declare const initializeDatabase: () => Promise<PrismaClient>;
export declare const getPrisma: () => PrismaClient;
export declare const closeDatabase: () => Promise<void>;
//# sourceMappingURL=database.d.ts.map