/**
 * API Route: OpenAPI Specification
 * 
 * Serves the OpenAPI/Swagger specification for the Invista API.
 * Provides both JSON spec and interactive Swagger UI.
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateOpenAPISpec, generateSwaggerHTML } from '@/lib/openapi'

/**
 * GET /api/docs
 * Serve OpenAPI specification or Swagger UI
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')

    const spec = generateOpenAPISpec()

    // Return JSON specification
    if (format === 'json') {
      return NextResponse.json(spec, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Return Swagger UI HTML
    const html = generateSwaggerHTML(spec)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('Error generating API documentation:', error)
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/docs
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
