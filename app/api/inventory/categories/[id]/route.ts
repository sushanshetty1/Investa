import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  checkRateLimit
} from '@/lib/api-utils'
import { authenticate } from '@/lib/auth'
import {
  updateCategorySchema,
  type UpdateCategoryInput
} from '@/lib/validations/category'
import {
  getCategory,
  updateCategory,
  deleteCategory
} from '@/lib/actions/categories'

// Rate limiting
const RATE_LIMIT = 60
const RATE_WINDOW = 60 * 1000 // 1 minute

function getClientIdentifier(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
}

// GET /api/inventory/categories/[id] - Get category by ID
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
      return errorResponse('Invalid category ID format', 400)
    }

    const result = await getCategory(id)

    if (!result.success) {
      return errorResponse(result.error!, result.error === 'Category not found' ? 404 : 400)
    }

    return successResponse(result.data, result.message)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/inventory/categories/[id] - Update category
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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return errorResponse('Invalid category ID format', 400)
    }    // Parse request body
    const body = await request.json()

    // Authentication check
    const user = await authenticate(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const updateInput: UpdateCategoryInput = {
      id,
      ...body,
    }

    // Validate input
    const validatedInput = updateCategorySchema.parse(updateInput)

    // Update category using server action
    const result = await updateCategory(validatedInput)

    if (!result.success) {
      return errorResponse(result.error!, result.error === 'Category not found' ? 404 : 400)
    }

    return successResponse(result.data, result.message)
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/inventory/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting (strictest for delete operations)
    const clientId = getClientIdentifier(request)
    if (!checkRateLimit(`${clientId}:delete`, 10, RATE_WINDOW)) {
      return errorResponse('Rate limit exceeded for delete operations', 429)
    }

    const { id } = await params    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return errorResponse('Invalid category ID format', 400)
    }

    // Authentication check
    const user = await authenticate(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    // Delete category using server action
    const result = await deleteCategory(id)

    if (!result.success) {
      return errorResponse(result.error!, result.error === 'Category not found' ? 404 : 400)
    }

    return successResponse(result.data, result.message)
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
