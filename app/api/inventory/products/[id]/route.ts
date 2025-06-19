import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  checkRateLimit
} from '@/lib/api-utils'
import {
  updateProductSchema,
  type UpdateProductInput
} from '@/lib/validations/product'
import {
  getProduct,
  updateProduct,
  deleteProduct
} from '@/lib/actions/products'
import { authenticate } from '@/lib/auth'

// Rate limiting
const RATE_LIMIT = 60
const RATE_WINDOW = 60 * 1000 // 1 minute

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] :
    request.headers.get('x-real-ip') ||
    'unknown'
  return ip
}

// GET /api/inventory/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    if (!checkRateLimit(clientId, RATE_LIMIT, RATE_WINDOW)) {
      return errorResponse('Rate limit exceeded', 429)
    }

    const { id } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return errorResponse('Invalid product ID format', 400)
    }

    const result = await getProduct(id)

    if (!result.success) {
      return errorResponse(result.error!, result.error === 'Product not found' ? 404 : 400)
    }

    return successResponse(result.data, result.message)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/inventory/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting (stricter for write operations)
    const clientId = getClientIdentifier(request)
    if (!checkRateLimit(`${clientId}:write`, 20, RATE_WINDOW)) {
      return errorResponse('Rate limit exceeded for write operations', 429)
    }

    const { id } = await params
    const body = await request.json()    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return errorResponse('Invalid product ID format', 400)
    }

    // Authentication check
    const user = await authenticate(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const updateInput: UpdateProductInput = {
      id,
      ...body
    }

    // Validate input
    const validatedInput = updateProductSchema.parse(updateInput)

    // Update product using server action
    const result = await updateProduct(validatedInput)

    if (!result.success) {
      return errorResponse(result.error!, result.error === 'Product not found' ? 404 : 400)
    }

    return successResponse(result.data, result.message)
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/inventory/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting (stricter for delete operations)
    const clientId = getClientIdentifier(request)
    if (!checkRateLimit(`${clientId}:delete`, 10, RATE_WINDOW)) {
      return errorResponse('Rate limit exceeded for delete operations', 429)
    }

    const { id } = await params    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return errorResponse('Invalid product ID format', 400)
    }

    // Authentication check
    const user = await authenticate(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const result = await deleteProduct(id)

    if (!result.success) {
      return errorResponse(result.error!, result.error === 'Product not found' ? 404 : 400)
    }

    return successResponse(null, result.message)
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}