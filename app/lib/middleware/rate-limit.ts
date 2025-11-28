/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting the number of requests per IP/user
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests per window
  message?: string;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      message: config.message || 'Too many requests, please try again later.',
      statusCode: config.statusCode || 429,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
    };

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request should be rate limited
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store[identifier];

    // No entry or expired entry
    if (!entry || now > entry.resetTime) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Record a request (for skip options)
   */
  record(identifier: string, success: boolean) {
    if (
      (success && this.config.skipSuccessfulRequests) ||
      (!success && this.config.skipFailedRequests)
    ) {
      return;
    }

    const entry = this.store[identifier];
    if (entry) {
      entry.count++;
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string) {
    delete this.store[identifier];
  }

  /**
   * Clean up expired entries
   */
  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }

  /**
   * Get current stats for an identifier
   */
  getStats(identifier: string): { count: number; remaining: number; resetTime: number } | null {
    const entry = this.store[identifier];
    if (!entry) {
      return null;
    }

    return {
      count: entry.count,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }
}

/**
 * Create rate limiter middleware for Remix
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);

  return async (request: Request): Promise<Response | null> => {
    // Get identifier (IP address or user ID)
    const identifier = getIdentifier(request);

    // Check rate limit
    const result = limiter.check(identifier);

    // Add rate limit headers
    const headers = new Headers({
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    });

    // If rate limit exceeded, return 429 response
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      headers.set('Retry-After', retryAfter.toString());

      return new Response(
        JSON.stringify({
          error: config.message || 'Too many requests',
          retryAfter,
        }),
        {
          status: config.statusCode || 429,
          headers: {
            ...Object.fromEntries(headers),
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Request allowed, return null to continue
    return null;
  };
}

/**
 * Get identifier from request (IP address or user ID)
 */
function getIdentifier(request: Request): string {
  // Try to get user ID from session/auth
  // For now, use IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

  return ip;
}

/**
 * Pre-configured rate limiters
 */

// API endpoints - 100 requests per 15 minutes
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: 'Too many API requests, please try again later.',
});

// Authentication endpoints - 5 requests per 15 minutes
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// File upload endpoints - 20 requests per hour
export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 20,
  message: 'Too many upload requests, please try again later.',
});

// Project creation - 10 projects per hour
export const projectCreationRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many projects created, please try again later.',
});
