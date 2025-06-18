import { neonClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/inventory/suppliers - List suppliers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status) where.status = status

    // Fetch suppliers with aggregated data
    const [suppliers, total] = await Promise.all([
      neonClient.supplier.findMany({
        where,
        include: {
          purchaseOrders: {
            select: {
              id: true,
              totalAmount: true,
              orderDate: true,
              status: true
            }
          },
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  status: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      neonClient.supplier.count({ where })
    ])

    // Calculate performance metrics for each supplier
    const suppliersWithMetrics = suppliers.map(supplier => {
      const totalPurchaseOrders = supplier.purchaseOrders.length
      const totalSpent = supplier.purchaseOrders.reduce((sum, po) => sum + po.totalAmount.toNumber(), 0)
      const activeProducts = supplier.products.filter(p => p.product.status === 'ACTIVE').length
      const lastOrderDate = supplier.purchaseOrders.length > 0 
        ? supplier.purchaseOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0].orderDate
        : null

      return {
        ...supplier,
        totalPurchaseOrders,
        totalSpent,
        activeProducts,
        lastOrderDate
      }
    })

    return NextResponse.json({
      suppliers: suppliersWithMetrics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/suppliers - Create new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingSupplier = await neonClient.supplier.findUnique({
      where: { code: body.code }
    })

    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier code already exists' },
        { status: 400 }
      )
    }

    // Create supplier
    const supplier = await neonClient.supplier.create({
      data: {
        name: body.name,
        code: body.code,
        email: body.email,
        phone: body.phone,
        website: body.website,
        companyType: body.companyType,
        taxId: body.taxId,
        vatNumber: body.vatNumber,
        registrationNumber: body.registrationNumber,
        billingAddress: body.billingAddress,
        shippingAddress: body.shippingAddress,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        contactTitle: body.contactTitle,
        paymentTerms: body.paymentTerms,
        creditLimit: body.creditLimit,
        currency: body.currency || 'USD',
        rating: body.rating,
        onTimeDelivery: body.onTimeDelivery,
        qualityRating: body.qualityRating,
        status: body.status || 'ACTIVE',
        certifications: body.certifications,
        notes: body.notes,
        createdBy: body.createdBy || 'system' // This should come from auth context
      }
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
}
