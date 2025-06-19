import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  checkRateLimit
} from '@/lib/api-utils'
import { authenticate } from '@/lib/auth'
import {
  productQuerySchema,
  createProductSchema,
  type ProductQueryInput,
  type CreateProductInput
} from '@/lib/validations/product'
import {
  getProducts,
  createProduct
} from '@/lib/actions/products'

// Rate limiting: 100 requests per minute per IP
const RATE_LIMIT = 100
const RATE_WINDOW = 60 * 1000 // 1 minute

function getClientIdentifier(request: NextRequest): string {
  // Get client IP for rate limiting
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] :
    request.headers.get('x-real-ip') ||
    'unknown'
  return ip
}

// GET /api/inventory/products - List products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    if (!checkRateLimit(clientId, RATE_LIMIT, RATE_WINDOW)) {
      return errorResponse('Rate limit exceeded', 429)
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)

    const queryInput: ProductQueryInput = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // Max 100 items
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined, brandId: searchParams.get('brandId') || undefined,
      status: (searchParams.get('status') as 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DRAFT') || undefined,
      sortBy: (searchParams.get('sortBy') as 'name' | 'sku' | 'createdAt' | 'updatedAt') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    }

    // Validate query parameters
    const validatedQuery = productQuerySchema.parse(queryInput)

    // Fetch products using server action
    const result = await getProducts(validatedQuery)

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

// POST /api/inventory/products - Create new product
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for write operations)
    const clientId = getClientIdentifier(request)
    if (!checkRateLimit(`${clientId}:write`, 20, RATE_WINDOW)) {
      return errorResponse('Rate limit exceeded for write operations', 429)
    }

    // Parse request body
    const body = await request.json()

    // Authentication check
    const authResult = await authenticate(request)
    if (!authResult.success) {
      return errorResponse('Unauthorized', 401)
    }

    // Use authenticated user ID
    const userId = authResult.user?.id || 'system'
    const createInput: CreateProductInput = {
      ...body,
      createdBy: body.createdBy || userId
    }

    // Validate input
    const validatedInput = createProductSchema.parse(createInput)

    // Create product using server action
    const result = await createProduct(validatedInput)

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
