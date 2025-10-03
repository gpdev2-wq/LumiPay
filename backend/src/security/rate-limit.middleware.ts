import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100; // 100 requests per window

    const key = `${ip}:${req.path}`;
    const current = rateLimitMap.get(key);

    if (!current || now > current.resetTime) {
      // Reset or create new entry
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
    } else if (current.count < maxRequests) {
      // Increment count
      current.count++;
      next();
    } else {
      // Rate limit exceeded
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
      });
    }
  }
}
