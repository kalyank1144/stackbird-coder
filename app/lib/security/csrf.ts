/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Generates and validates CSRF tokens to prevent unauthorized requests
 */

import { createHash, randomBytes } from 'crypto';

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a CSRF token for storage
 */
export function hashCSRFToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(token: string, hashedToken: string): boolean {
  const tokenHash = hashCSRFToken(token);
  return tokenHash === hashedToken;
}

/**
 * CSRF middleware for Remix
 */
export async function validateCSRFToken(request: Request, sessionToken?: string): Promise<boolean> {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  // Get CSRF token from header or form data
  const headerToken = request.headers.get('X-CSRF-Token');
  
  let bodyToken: string | null = null;
  try {
    const contentType = request.headers.get('Content-Type');
    if (contentType?.includes('application/json')) {
      const body = await request.clone().json();
      bodyToken = body.csrfToken;
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.clone().formData();
      bodyToken = formData.get('csrfToken') as string;
    }
  } catch {
    // Ignore parsing errors
  }

  const token = headerToken || bodyToken;

  if (!token || !sessionToken) {
    return false;
  }

  return verifyCSRFToken(token, sessionToken);
}

/**
 * Add CSRF token to response headers
 */
export function addCSRFTokenToResponse(response: Response, token: string): Response {
  const headers = new Headers(response.headers);
  headers.set('X-CSRF-Token', token);
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Security Headers
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https:",
  ].join('; '),
  
  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Check if origin is allowed (for CORS)
 */
export function isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
}

/**
 * Apply CORS headers
 */
export function applyCORSHeaders(
  response: Response,
  origin: string,
  allowedOrigins: string[] = ['*'],
): Response {
  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
