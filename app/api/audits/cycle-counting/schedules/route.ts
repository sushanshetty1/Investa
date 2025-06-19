import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

// This API manages cycle counting schedules by creating recurring audits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const warehouseId = searchParams.get('warehouseId')

    const where: any = {
      type: 'CYCLE_COUNT'
    }
    
    if (status) {
      where.status = status
    }
    
    if (warehouseId) {
      where.warehouseId = warehouseId
    }

    const [audits, total] = await Promise.all([
      neonClient.inventoryAudit.findMany({
        where,
        orderBy: { plannedDate: 'asc' },
        skip: offset,
        take: limit,
        include: {
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          },
          _count: {
            select: {
              items: true
            }
          }
        }
      }),
      neonClient.inventoryAudit.count({ where })
    ])

    // Transform audits to include schedule-like information
    const schedules = audits.map(audit => ({
      id: audit.id,
      name: `Cycle Count - ${audit.warehouse?.name || audit.product?.name || 'All Products'}`,
      auditNumber: audit.auditNumber,
      warehouseId: audit.warehouseId,
      productId: audit.productId,
      warehouse: audit.warehouse,
      product: audit.product,
      status: audit.status,
      plannedDate: audit.plannedDate,
      nextCountDate: audit.plannedDate,
      completedDate: audit.completedDate,
      itemCount: audit._count.items,
      totalItems: audit.totalItems,
      discrepancies: audit.discrepancies,
      type: 'CYCLE_COUNT',
      frequency: 'MONTHLY', // This could be stored in notes or a separate field
      priority: 'MEDIUM',
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt
    }))

    return NextResponse.json({
      schedules,
      total,
      hasMore: offset + limit < total
    })

  } catch (error) {
    console.error('Error fetching cycle count schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cycle count schedules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      warehouseId,
      productId,
      frequency = 'MONTHLY',
      plannedDate,
      priority = 'MEDIUM',
      auditedBy = 'system' // This should come from auth context
    } = body

    // Validate required fields
    if (!name || !plannedDate) {
      return NextResponse.json(
        { error: 'Name and planned date are required' },
        { status: 400 }
      )
    }

    // Verify warehouse exists if provided
    if (warehouseId) {
      const warehouse = await neonClient.warehouse.findUnique({
        where: { id: warehouseId }
      })

      if (!warehouse) {
        return NextResponse.json(
          { error: 'Warehouse not found' },
          { status: 404 }
        )
      }
    }

    // Verify product exists if provided
    if (productId) {
      const product = await neonClient.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
    }

    // Generate audit number
    const auditNumber = `CC-${Date.now()}`

    // Create cycle count audit
    const audit = await neonClient.inventoryAudit.create({
      data: {
        auditNumber,
        warehouseId,
        productId,
        type: 'CYCLE_COUNT',
        method: 'ABC_ANALYSIS',
        status: 'PLANNED',
        plannedDate: new Date(plannedDate),
        auditedBy,
        notes: `${description || ''}\nFrequency: ${frequency}\nPriority: ${priority}`.trim()
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      }
    })

    // Transform response to match schedule format
    const schedule = {
      id: audit.id,
      name,
      auditNumber: audit.auditNumber,
      warehouseId: audit.warehouseId,
      productId: audit.productId,
      warehouse: audit.warehouse,
      product: audit.product,
      status: audit.status,
      plannedDate: audit.plannedDate,
      nextCountDate: audit.plannedDate,
      type: 'CYCLE_COUNT',
      frequency,
      priority,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt
    }

    return NextResponse.json(schedule, { status: 201 })

  } catch (error) {
    console.error('Error creating cycle count schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create cycle count schedule' },
      { status: 500 }
    )
  }
}
