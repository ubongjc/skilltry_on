import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Returns system status and basic diagnostics
 *
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Returns the health status of the API and its dependencies
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ok, degraded, error]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       enum: [healthy, unhealthy]
 *                     storage:
 *                       type: string
 *                       enum: [healthy, unhealthy]
 */
export async function GET() {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        api: 'healthy',
        // Database check would go here
        // database: await checkDatabase(),
        // Storage check would go here
        // storage: await checkStorage(),
      },
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
