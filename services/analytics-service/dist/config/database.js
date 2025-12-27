"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.getPrisma = exports.initializeDatabase = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
let prisma = null;
const initializeDatabase = async () => {
    try {
        prisma = new client_1.PrismaClient({
            log: [
                { level: 'query', emit: 'event' },
                { level: 'error', emit: 'stdout' },
                { level: 'warn', emit: 'stdout' },
            ],
        });
        await prisma.$connect();
        logger_1.default.info('✅ Database connection established successfully');
        return prisma;
    }
    catch (error) {
        logger_1.default.error('❌ Failed to initialize database:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
const getPrisma = () => {
    if (!prisma) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return prisma;
};
exports.getPrisma = getPrisma;
const closeDatabase = async () => {
    if (prisma) {
        await prisma.$disconnect();
        prisma = null;
        logger_1.default.info('Database connection closed');
    }
};
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=database.js.map