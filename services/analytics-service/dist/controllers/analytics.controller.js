"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const logger_1 = __importDefault(require("../utils/logger"));
class AnalyticsController {
    async getEvents(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;
            const sourceService = req.query.sourceService;
            const startDateStr = req.query.startDate;
            const endDateStr = req.query.endDate;
            const startDate = startDateStr ? new Date(startDateStr) : undefined;
            const endDate = endDateStr ? new Date(endDateStr) : undefined;
            const result = await analytics_service_1.analyticsService.getEvents({
                sourceService,
                startDate,
                endDate,
                limit,
                offset,
            });
            res.status(200).json({
                success: true,
                data: result.events,
                pagination: {
                    total: result.total,
                    limit,
                    offset,
                    hasMore: offset + result.events.length < result.total,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Error getting events:', error);
            next(error);
        }
    }
    async getEventsByType(req, res, next) {
        try {
            const { type } = req.params;
            const limit = parseInt(req.query.limit) || 100;
            if (!type) {
                res.status(400).json({
                    success: false,
                    error: 'Event type is required',
                });
                return;
            }
            const events = await analytics_service_1.analyticsService.getEventsByType(type, limit);
            res.status(200).json({
                success: true,
                data: events,
                count: events.length,
                eventType: type,
            });
        }
        catch (error) {
            logger_1.default.error('Error getting events by type:', error);
            next(error);
        }
    }
    async getStatistics(_req, res, next) {
        try {
            const stats = await analytics_service_1.analyticsService.getStatistics();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            logger_1.default.error('Error getting statistics:', error);
            next(error);
        }
    }
}
exports.AnalyticsController = AnalyticsController;
exports.analyticsController = new AnalyticsController();
//# sourceMappingURL=analytics.controller.js.map