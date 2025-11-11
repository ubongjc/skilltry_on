import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // milliseconds
  uniqueTokenPerInterval: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Clean up expired entries every minute
    setInterval(() => {
      const now = Date.now();
      Object.keys(this.store).forEach((key) => {
        if (this.store[key].resetTime < now) {
          delete this.store[key];
        }
      });
    }, 60000);
  }

  async check(identifier: string, limit: number): Promise<{
    success: boolean;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const resetTime = now + this.config.interval;

    if (!this.store[identifier] || this.store[identifier].resetTime < now) {
      this.store[identifier] = {
        count: 1,
        resetTime,
      };

      return {
        success: true,
        remaining: limit - 1,
        reset: resetTime,
      };
    }

    const current = this.store[identifier];

    if (current.count >= limit) {
      return {
        success: false,
        remaining: 0,
        reset: current.resetTime,
      };
    }

    current.count++;

    return {
      success: true,
      remaining: limit - current.count,
      reset: current.resetTime,
    };
  }
}

// Default rate limiters
export const rateLimiters = {
  // API calls: 100 requests per minute
  api: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
  }),

  // Authentication: 5 attempts per 15 minutes
  auth: new RateLimiter({
    interval: 15 * 60 * 1000,
    uniqueTokenPerInterval: 100,
  }),

  // File uploads: 10 per hour
  upload: new RateLimiter({
    interval: 60 * 60 * 1000,
    uniqueTokenPerInterval: 200,
  }),

  // Webhook: 1000 per minute (for payment webhooks)
  webhook: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 1000,
  }),
};

/**
 * Get client identifier from request
 * Uses IP address or user ID if authenticated
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const userId = extractUserIdFromToken(authHeader);
    if (userId) return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] :
    request.headers.get('x-real-ip') ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * Extract user ID from JWT token (simplified)
 * In production, use proper JWT verification
 */
function extractUserIdFromToken(authHeader: string): string | null {
  try {
    const token = authHeader.replace('Bearer ', '');
    // This is simplified - use proper JWT verification in production
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    return payload.sub || payload.userId;
  } catch {
    return null;
  }
}

/**
 * Apply rate limiting to a route handler
 */
export async function withRateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  limit: number,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const identifier = getClientIdentifier(request);
  const result = await limiter.check(identifier, limit);

  // Add rate limit headers
  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  const response = await handler(request);

  // Add rate limit headers to successful response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Rate limit middleware wrapper
 */
export function rateLimit(
  limiter: RateLimiter = rateLimiters.api,
  limit: number = 100
) {
  return async (
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    return withRateLimit(request, limiter, limit, handler);
  };
}
