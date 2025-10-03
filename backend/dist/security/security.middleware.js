"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityMiddleware = void 0;
const common_1 = require("@nestjs/common");
let SecurityMiddleware = class SecurityMiddleware {
    use(req, res, next) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self' https://api.trongrid.io https://api.tronstack.io",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; ');
        res.setHeader('Content-Security-Policy', csp);
        this.logSecurityEvent(req);
        next();
    }
    logSecurityEvent(req) {
        const suspiciousPatterns = [
            /script/i,
            /javascript/i,
            /vbscript/i,
            /onload/i,
            /onerror/i,
            /<script/i,
            /union.*select/i,
            /drop.*table/i,
            /insert.*into/i,
            /delete.*from/i,
        ];
        const url = req.url;
        const userAgent = req.get('User-Agent') || '';
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url) || pattern.test(userAgent));
        if (isSuspicious) {
            console.log(`🚨 SECURITY ALERT: Suspicious request from ${ip}`, {
                url,
                userAgent,
                timestamp: new Date().toISOString(),
            });
        }
    }
};
exports.SecurityMiddleware = SecurityMiddleware;
exports.SecurityMiddleware = SecurityMiddleware = __decorate([
    (0, common_1.Injectable)()
], SecurityMiddleware);
//# sourceMappingURL=security.middleware.js.map