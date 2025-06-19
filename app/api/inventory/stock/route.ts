import { NextRequest } from 'next/server'
import { 
  successResponse, 
  errorResponse, 
  handleError, 
  checkRateLimit 
} from '@/lib/api-utils'
import { 
  inventoryQuerySchema,
  stockAdjustmentSchema,
  stockTransferSchema,
  type InventoryQueryInput,
  type StockAdjustmentInput,
  type StockTransferInput 
} from '@/lib/validations/inventory'
import { 
  getInventory,
  adjustStock,
  transferStock,
  getLowStockAlerts 
} from '@/lib/actions/inventory'

// Rate limiting: 200 requests per minute per IP (higher for read-heavy operations)
const RATE_LIMIT = 200
const RATE_WINDOW = 60 * 1000 // 1 minute

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown'
  return ip
}

// GET /api/inventory/stock - List inventory with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    if (!checkRateLimit(clientId, RATE_LIMIT, RATE_WINDOW)) {
      return errorResponse('Rate limit exceeded', 429)
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    
    // Check for special endpoints
    if (searchParams.get('alerts') === 'true') {
      const result = await getLowStockAlerts()
      if (!result.success) {
        return errorResponse(result.error!, 400)
      }
      return successResponse(result.data, result.message)
    }
    
    const queryInput: InventoryQueryInput = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      search: searchParams.get('search') || undefined,
      warehouseId: searchParams.get('warehouseId') || undefined,
      productId: searchParams.get('productId') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      brandId: searchParams.get('brandId') || undefined,      status: (searchParams.get('status') as 'AVAILABLE' | 'RESERVED' | 'QUARANTINE' | 'DAMAGED' | 'EXPIRED' | 'RECALLED') || undefined,
      lowStock: searchParams.get('lowStock') === 'true' || undefined,
      sortBy: (searchParams.get('sortBy') as 'quantity' | 'product' | 'warehouse' | 'lastMovement' | 'createdAt') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    }

    // Validate query parameters
    const validatedQuery = inventoryQuerySchema.parse(queryInput)

    // Fetch inventory using server action
    const result = await getInventory(validatedQuery)

    if (!result.success) {
      return errorResponse(result.error!, 400)
    }

    return successResponse(result.data, result.message)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/inventory/stock - Stock operations (adjustments, transfers, etc.)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for write operations)
    const clientId = getClientIdentifier(request)
    if (!checkRateLimit(`${clientId}:write`, 30, RATE_WINDOW)) {
      return errorResponse('Rate limit exceeded for write operations', 429)
    }

    // Parse request body
    const body = await request.json()

    // TODO: Add authentication check here
    // const user = await authenticate(request)
    // if (!user) return errorResponse('Unauthorized', 401)

    // Determine operation type
    const operation = body.operation

    if (!operation) {
      return errorResponse('Operation type is required', 400)
    }

    let result

    switch (operation) {
      case 'adjust':
        const adjustInput: StockAdjustmentInput = {
          productId: body.productId,
          variantId: body.variantId,
          warehouseId: body.warehouseId,
          adjustmentType: body.adjustmentType,
          quantity: body.quantity,
          reason: body.reason,
          notes: body.notes,
          userId: body.userId || 'system', // Should come from authenticated user
          approvedBy: body.approvedBy,
        }
        const validatedAdjustInput = stockAdjustmentSchema.parse(adjustInput)
        result = await adjustStock(validatedAdjustInput)
        break

      case 'transfer':
        const transferInput: StockTransferInput = {
          fromWarehouseId: body.fromWarehouseId,
          toWarehouseId: body.toWarehouseId,
          productId: body.productId,
          variantId: body.variantId,
          quantity: body.quantity,
          reason: body.reason,
          notes: body.notes,
          requestedBy: body.requestedBy || 'system', // Should come from authenticated user
          expectedDate: body.expectedDate,
        }
        const validatedTransferInput = stockTransferSchema.parse(transferInput)
        result = await transferStock(validatedTransferInput)
        break

      default:
        return errorResponse('Invalid operation type', 400)
    }

    if (!result.success) {
      return errorResponse(result.error!, 400)
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}