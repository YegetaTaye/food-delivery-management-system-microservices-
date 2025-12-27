"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const env_1 = require("../config/env");
class HealthController {
    static getHealth(_req, res) {
        return res.status(200).json({
            status: 'ok',
            service: env_1.config.serviceName,
            timestamp: new Date().toISOString(),
        });
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map