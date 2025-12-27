"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
const database_1 = require("../config/database");
const logger_1 = __importDefault(require("../utils/logger"));
class AnalyticsService {
    async storeEvent(eventType, sourceService, payload) {
        const prisma = (0, database_1.getPrisma)();
        const event = await prisma.analyticsEvent.create({
            data: {
                eventType,
                sourceService,
                payload: payload,
            },
        });
        logger_1.default.info(`📊 Analytics event stored: ${eventType}`, {
            eventId: event.id,
            eventType,
            sourceService,
        });
        return {
            id: event.id,
            eventType: event.eventType,
            sourceService: event.sourceService,
            payload: event.payload,
            createdAt: event.createdAt,
        };
    }
    async getEvents(params = {}) {
        const prisma = (0, database_1.getPrisma)();
        const { eventType, sourceService, startDate, endDate, limit = 100, offset = 0 } = params;
        const where = {};
        if (eventType) {
            where.eventType = eventType;
        }
        if (sourceService) {
            where.sourceService = sourceService;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = startDate;
            }
            if (endDate) {
                where.createdAt.lte = endDate;
            }
        }
        const [events, total] = await Promise.all([
            prisma.analyticsEvent.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.analyticsEvent.count({ where }),
        ]);
        return {
            events: events.map((e) => ({
                id: e.id,
                eventType: e.eventType,
                sourceService: e.sourceService,
                payload: e.payload,
                createdAt: e.createdAt,
            })),
            total,
        };
    }
    async getEventsByType(eventType, limit = 100) {
        const result = await this.getEvents({ eventType, limit });
        return result.events;
    }
    async getStatistics() {
        const prisma = (0, database_1.getPrisma)();
        const [totalEvents, eventTypeGroups, sourceServiceGroups] = await Promise.all([
            prisma.analyticsEvent.count(),
            prisma.analyticsEvent.groupBy({
                by: ['eventType'],
                _count: { eventType: true },
            }),
            prisma.analyticsEvent.groupBy({
                by: ['sourceService'],
                _count: { sourceService: true },
            }),
        ]);
        const byEventType = {};
        eventTypeGroups.forEach((g) => {
            byEventType[g.eventType] = g._count.eventType;
        });
        const bySourceService = {};
        sourceServiceGroups.forEach((g) => {
            bySourceService[g.sourceService] = g._count.sourceService;
        });
        return {
            totalEvents,
            byEventType,
            bySourceService,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
//# sourceMappingURL=analytics.service.js.map