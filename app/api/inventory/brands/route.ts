import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  checkRateLimit
} from '@/lib/api-utils'
import { authenticate } from '@/lib/auth'
import {
  brandQuerySchema,
  createBrandSchema,
  type BrandQueryInput,
  type CreateBrandInput
} from '@/lib/validations/brand'
import {
  getBrands,
  createBrand
} from '@/lib/actions/brands'

// Rate limiting: 100 requests per minute per IP
const RATE_LIMIT = 100
const RATE_WINDOW = 60 * 1000 // 1 minute

function getClientIdentifier(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
}

// GET /api/inventory/brands - List brands
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    if (!checkRateLimit(clientId, RATE_LIMIT, RATE_WINDOW)) {
      return errorResponse('Rate limit exceeded', 429)
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)

    const queryInput: BrandQueryInput = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // Max 100 items
      search: searchParams.get('search') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined, sortBy: (searchParams.get('sortBy') as 'name' | 'createdAt' | 'updatedAt') || 'name',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    }

    // Validate query parameters
    const validatedQuery = brandQuerySchema.parse(queryInput)

    // Fetch brands using server action
    const result = await getBrands(validatedQuery)

    if (!result.success) {
      return errorResponse(result.error!, 400)
    }

    return successResponse(
      result.data,
      result.message
    )

  } catch (error) {
    return handleError(error)
  }
}

// POST /api/inventory/brands - Create brand
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for write operations)
    const clientId = getClientIdentifier(request)
    if (!checkRateLimit(`${clientId}:write`, 20, RATE_WINDOW)) {
      return errorResponse('Rate limit exceeded for write operations', 429)
    }    // Parse request body
    const body = await request.json()

    // Authentication check
    const user = await authenticate(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const createInput: CreateBrandInput = body

    // Validate input
    const validatedInput = createBrandSchema.parse(createInput)

    // Create brand using server action
    const result = await createBrand(validatedInput)

    if (!result.success) {
      return errorResponse(result.error!, 400)
    }

    return successResponse(
      result.data,
      result.message,
      undefined
    )

  } catch (error) {
    return handleError(error)
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
