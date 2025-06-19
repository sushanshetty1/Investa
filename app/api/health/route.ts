/**
 * API Route: Health Check and API Status
 * 
 * Provides health check endpoint and general API information.
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

/**
 * GET /api/health
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const check = searchParams.get('check') // Basic health check
    
    interface HealthStatus {
      status: string
      timestamp: string
      version: string
      environment: string
      uptime: number
      database?: string
      services?: {
        database: string
        api: string
        rateLimit: string
      }
    }
    
    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    }

    // Extended health check with database connectivity
    if (check === 'full') {
      try {
        // Test database connectivity
        await neonClient.$queryRaw`SELECT 1`
        health.database = 'connected'
      } catch {
        health.database = 'disconnected'
        health.status = 'degraded'
      }

      // Add more health checks as needed
      health.services = {
        database: health.database,
        api: 'operational',
        rateLimit: 'operational'
      }
    }

    return NextResponse.json({
      success: true,
      data: health
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch {
    console.error('Health check error:', 'Health check failed')
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}

/**
 * OPTIONS /api/health
 * Handle preflight requests for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}
