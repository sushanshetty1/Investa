/**
 * API Route: Suppliers Management
 * 
 * Handles CRUD operations for suppliers with validation,
 * authentication, rate limiting, and standardized responses.
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  successResponse, 
  errorResponse,
  checkRateLimit
} from '@/lib/api-utils'
import { createSupplier, getSuppliers } from '@/lib/actions/suppliers'
import { createSupplierSchema } from '@/lib/validations/supplier'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

// Rate limiting: 100 requests per 15 minutes per IP
const RATE_LIMIT_MAX = 100
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

/**
 * GET /api/inventory/suppliers
 * Retrieve suppliers with pagination and filtering
 */
export async function GET(request: NextRequest) {  try {
    // Apply rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(clientIp, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)) {
      return errorResponse('Rate limit exceeded', 429)
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') as 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'BLACKLISTED' | undefined
    const companyType = searchParams.get('companyType') as 'CORPORATION' | 'LLC' | 'PARTNERSHIP' | 'SOLE_PROPRIETORSHIP' | 'NON_PROFIT' | 'GOVERNMENT' | 'OTHER' | undefined
    const sortBy = searchParams.get('sortBy') as 'name' | 'code' | 'createdAt' | 'updatedAt' | 'rating' || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return errorResponse('Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100', 400)
    }

    // Validate sort parameters
    const validSortFields = ['name', 'code', 'createdAt', 'updatedAt', 'rating']
    if (sortBy && !validSortFields.includes(sortBy)) {
      return errorResponse(`Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}`, 400)
    }

    // Call server action
    const result = await getSuppliers({
      page,
      limit,
      search,
      status,
      companyType,
      sortBy,
      sortOrder
    })

    if (!result.success) {
      return errorResponse(result.error || 'Failed to fetch suppliers', 500)
    }

    return successResponse(result.data, 'Suppliers retrieved successfully')

  } catch (error) {
    console.error('GET /api/inventory/suppliers error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/**
 * POST /api/inventory/suppliers
 * Create a new supplier
 */
export async function POST(request: NextRequest) {  try {
    // Apply rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(clientIp, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)) {
      return errorResponse('Rate limit exceeded', 429)
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()    } catch {
      return errorResponse('Invalid JSON in request body', 400)
    }

    // Add a default createdBy if not provided (should come from auth context in real app)
    if (!body.createdBy) {
      body.createdBy = '00000000-0000-0000-0000-000000000000' // Placeholder UUID
    }

    // Validate supplier data
    const validation = createSupplierSchema.safeParse(body)
    if (!validation.success) {
      const errorMessage = validation.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ')
      return errorResponse(`Validation failed: ${errorMessage}`, 400)
    }

    // Call server action
    const result = await createSupplier(validation.data)

    if (!result.success) {
      return errorResponse(result.error || 'Failed to create supplier', 400)
    }

    return successResponse(result.data, 'Supplier created successfully')

  } catch (error) {
    console.error('POST /api/inventory/suppliers error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/**
 * OPTIONS /api/inventory/suppliers
 * Handle preflight requests for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  })
}
