import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // HSTS (only in production)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Content Security Policy
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

    // Log security events
    this.logSecurityEvent(req);

    next();
  }

  private logSecurityEvent(req: Request) {
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

    // Check for suspicious patterns
    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(url) || pattern.test(userAgent)
    );

    if (isSuspicious) {
      console.log(`🚨 SECURITY ALERT: Suspicious request from ${ip}`, {
        url,
        userAgent,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
