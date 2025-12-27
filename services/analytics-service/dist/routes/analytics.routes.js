"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const router = (0, express_1.Router)();
router.get('/events', analytics_controller_1.analyticsController.getEvents.bind(analytics_controller_1.analyticsController));
router.get('/events/:type', analytics_controller_1.analyticsController.getEventsByType.bind(analytics_controller_1.analyticsController));
router.get('/stats', analytics_controller_1.analyticsController.getStatistics.bind(analytics_controller_1.analyticsController));
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map