/**
 * Sentry configuration for error tracking and observability
 *
 * To complete setup:
 * 1. Run: npx @sentry/wizard@latest -i nextjs
 * 2. Configure SENTRY_DSN in .env
 * 3. Set up error boundaries in components
 */

export const sentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',

  // Performance monitoring
  integrations: [
    // Add integrations as needed
  ],

  // Error filtering
  beforeSend(event: any) {
    // Filter out certain errors if needed
    return event;
  },
};

/**
 * Custom error logger with Sentry integration
 */
export function logError(error: Error, context?: Record<string, any>) {
  console.error('Error:', error, context);

  // In production, this would send to Sentry
  // Sentry.captureException(error, { extra: context });
}

/**
 * Track performance metric
 */
export function trackMetric(name: string, value: number, tags?: Record<string, string>) {
  console.debug(`Metric: ${name}`, value, tags);

  // In production, this would send to Sentry/OpenTelemetry
}
