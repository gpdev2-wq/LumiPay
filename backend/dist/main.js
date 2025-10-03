"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const security_middleware_1 = require("./security/security.middleware");
const rate_limit_middleware_1 = require("./security/rate-limit.middleware");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.use(new security_middleware_1.SecurityMiddleware().use);
    app.use(new rate_limit_middleware_1.RateLimitMiddleware().use);
    const corsOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'];
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
    });
    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`🚀 Backend server running on port ${port}`);
    console.log(`🔒 Security middleware enabled`);
}
bootstrap();
//# sourceMappingURL=main.js.map