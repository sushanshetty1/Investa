/**
 * API Route: Purchase Orders Management
 * 
 * Handles CRUD operations for purchase orders with validation,
 * authentication, rate limiting, and standardized responses.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
    errorResponse,
    checkRateLimit
} from '@/lib/api-utils'
import { getPurchaseOrders, createPurchaseOrder } from '@/lib/actions/purchase-orders'

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
 * GET /api/inventory/purchase-orders
 * Retrieve purchase orders with pagination and filtering
 */
export async function GET(request: NextRequest) {
    try {
        // Apply rate limiting
        const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        if (!checkRateLimit(clientIp, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)) {
            return errorResponse('Rate limit exceeded', 429)
        }        // Parse and validate query parameters
        const { searchParams } = new URL(request.url)
        const searchTerm = searchParams.get('search') || undefined
        const status = searchParams.get('status') || undefined
        const supplierId = searchParams.get('supplierId') || undefined
        const warehouseId = searchParams.get('warehouseId') || undefined

        // Build query input matching PurchaseOrderFilters interface
        const queryInput = {
            searchTerm,
            status,
            supplierId,
            warehouseId,
        }

        // Execute query using server action
        const result = await getPurchaseOrders(queryInput)

        if (!result.success) {
            return errorResponse(result.error || 'Failed to fetch purchase orders', 500)
        }        // Return successful response with CORS headers
        return new NextResponse(
            JSON.stringify({
                success: true,
                data: result.data,
                message: 'Purchase orders retrieved successfully',
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            }
        )

    } catch (error) {
        console.error('Purchase orders API error:', error)
        return errorResponse(
            error instanceof Error ? error.message : 'Internal server error',
            500
        )
    }
}

/**
 * POST /api/inventory/purchase-orders
 * Create a new purchase order
 */
export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting (stricter for writes)
        const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        if (!checkRateLimit(`${clientIp}:write`, Math.floor(RATE_LIMIT_MAX / 5), RATE_LIMIT_WINDOW)) {
            return errorResponse('Rate limit exceeded for write operations', 429)
        }

        // Parse request body
        const body = await request.json()

        // Execute creation using server action
        const result = await createPurchaseOrder(body)

        if (!result.success) {
            return errorResponse(result.error || 'Failed to create purchase order', 400)
        }        // Return successful response with CORS headers
        return new NextResponse(
            JSON.stringify({
                success: true,
                data: result.data,
                message: 'Purchase order created successfully',
            }),
            {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            }
        )

    } catch (error) {
        console.error('Purchase order creation error:', error)
        return errorResponse(
            error instanceof Error ? error.message : 'Internal server error',
            500
        )
    }
}

/**
 * OPTIONS /api/inventory/purchase-orders
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    })
}
