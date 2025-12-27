"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const error_middleware_1 = require("./middlewares/error.middleware");
const health_route_1 = __importDefault(require("./routes/health.route"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const logger_1 = __importDefault(require("./utils/logger"));
const env_1 = require("./config/env");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.generateSwaggerJson();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((req, _res, next) => {
            logger_1.default.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('user-agent'),
            });
            next();
        });
    }
    initializeRoutes() {
        this.app.use('/', health_route_1.default);
        this.app.use('/analytics', analytics_routes_1.default);
        this.app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
            explorer: true,
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: `${env_1.config.serviceName} API Docs`,
        }));
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found',
                path: req.originalUrl,
            });
        });
    }
    generateSwaggerJson() {
        const docsDir = path_1.default.join(process.cwd(), 'docs');
        if (!fs_1.default.existsSync(docsDir)) {
            fs_1.default.mkdirSync(docsDir, { recursive: true });
        }
        const swaggerPath = path_1.default.join(docsDir, 'swagger.json');
        fs_1.default.writeFileSync(swaggerPath, JSON.stringify(swagger_1.swaggerSpec, null, 2));
        logger_1.default.info(`Swagger documentation generated at ${swaggerPath}`);
    }
    initializeErrorHandling() {
        this.app.use(error_middleware_1.errorHandler);
    }
}
exports.default = new App().app;
//# sourceMappingURL=app.js.map