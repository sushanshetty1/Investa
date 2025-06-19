import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

// GET /api/audits - List all audits with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const warehouseId = searchParams.get('warehouseId')
    const dateRange = searchParams.get('dateRange')

    // Build where clause
    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status
    if (warehouseId) where.warehouseId = warehouseId

    // Date range filter
    if (dateRange) {
      const now = new Date()
      let fromDate = new Date()

      switch (dateRange) {
        case 'today':
          fromDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          fromDate.setDate(now.getDate() - 7)
          break
        case 'month':
          fromDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          fromDate.setMonth(now.getMonth() - 3)
          break
      }

      where.createdAt = { gte: fromDate }
    }

    const [audits, totalCount] = await Promise.all([
      neonClient.inventoryAudit.findMany({
        where,
        include: {
          warehouse: {
            select: { name: true }
          },
          product: {
            select: { name: true, sku: true }
          },
          items: {
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      neonClient.inventoryAudit.count({ where })
    ])

    // Transform the data to match our interface
    const transformedAudits = audits.map((audit: any) => ({
      id: audit.id,
      auditNumber: audit.auditNumber,
      type: audit.type,
      method: audit.method,
      status: audit.status,
      warehouseId: audit.warehouseId,
      warehouseName: audit.warehouse?.name,
      productId: audit.productId,
      productName: audit.product?.name,
      plannedDate: audit.plannedDate,
      startedDate: audit.startedDate,
      completedDate: audit.completedDate,
      auditedBy: audit.auditedBy,
      supervisedBy: audit.supervisedBy,
      totalItems: audit.totalItems,
      itemsCounted: audit.itemsCounted,
      discrepancies: audit.discrepancies,
      adjustmentValue: audit.adjustmentValue,
      notes: audit.notes,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt
    }))

    return NextResponse.json({
      audits: transformedAudits,
      total: totalCount,
      limit,
      offset
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/audits - Create a new audit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type,
      method,
      warehouseId,
      productId,
      plannedDate,
      supervisedBy,
      notes
    } = body

    // Validate required fields
    if (!type || !method || !plannedDate) {
      return NextResponse.json(
        { error: 'Missing required fields: type, method, plannedDate' },
        { status: 400 }
      )
    }

    // Generate audit number
    const auditNumber = `AUD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    // Get current user (in a real app, this would come from authentication)
    const auditedBy = 'current-user-id' // Replace with actual user ID from auth

    const auditData = {
      auditNumber,
      type,
      method,
      warehouseId: warehouseId || null,
      productId: productId || null,
      plannedDate: new Date(plannedDate),
      auditedBy,
      supervisedBy: supervisedBy || null,
      status: 'PLANNED' as const,
      notes: notes || null
    }

    const audit = await neonClient.inventoryAudit.create({
      data: auditData
    })

    // Generate audit items based on audit type and scope
    await generateAuditItems(audit.id, type, warehouseId, productId)

    return NextResponse.json({
      audit: {
        id: audit.id,
        auditNumber: audit.auditNumber,
        type: audit.type,
        method: audit.method,
        status: audit.status,
        warehouseId: audit.warehouseId,
        productId: audit.productId,
        plannedDate: audit.plannedDate,
        auditedBy: audit.auditedBy,
        supervisedBy: audit.supervisedBy,
        notes: audit.notes,
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate audit items
async function generateAuditItems(auditId: string, type: string, warehouseId?: string, productId?: string) {
  try {
    const where: any = {}
    if (warehouseId) where.warehouseId = warehouseId
    if (productId) where.productId = productId

    const inventoryItems = await neonClient.inventoryItem.findMany({
      where,
      include: {
        product: {
          select: { name: true, sku: true }
        }
      },
      take: type === 'CYCLE_COUNT' ? 100 : undefined // Limit cycle count items
    })

    // Create audit items
    const auditItems = inventoryItems.map((item: any) => ({
      auditId,
      productId: item.productId,
      warehouseId: item.warehouseId,
      systemQty: item.quantity,
      location: item.location,
      status: 'PENDING' as const
    }))

    await neonClient.inventoryAuditItem.createMany({
      data: auditItems
    })

    // Update audit with total items count
    await neonClient.inventoryAudit.update({
      where: { id: auditId },
      data: { totalItems: auditItems.length }
    })

  } catch (error) {
    console.error('Error generating audit items:', error)
  }
}
