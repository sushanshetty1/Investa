import { neonClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/inventory/products - List products with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const brandId = searchParams.get('brandId') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (categoryId) where.categoryId = categoryId
    if (brandId) where.brandId = brandId
    if (status) where.status = status

    // Fetch products with relations
    const [products, total] = await Promise.all([
      neonClient.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          inventoryItems: {
            select: {
              quantity: true,
              availableQuantity: true,
              reservedQuantity: true
            }
          },
          variants: {
            select: {
              id: true,
              name: true,
              sku: true,
              attributes: true,
              isActive: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      neonClient.product.count({ where })
    ])

    // Calculate stock totals for each product
    const productsWithStock = products.map(product => {
      const totalStock = product.inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
      const availableStock = product.inventoryItems.reduce((sum, item) => sum + item.availableQuantity, 0)
      const reservedStock = product.inventoryItems.reduce((sum, item) => sum + item.reservedQuantity, 0)

      return {
        ...product,
        totalStock,
        availableStock,
        reservedStock
      }
    })

    return NextResponse.json({
      products: productsWithStock,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.sku) {
      return NextResponse.json(
        { error: 'Name and SKU are required' },
        { status: 400 }
      )
    }

    // Check if SKU already exists
    const existingProduct = await neonClient.product.findUnique({
      where: { sku: body.sku }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      )
    }

    // Create product
    const product = await neonClient.product.create({
      data: {
        name: body.name,
        description: body.description,
        sku: body.sku,
        barcode: body.barcode,
        categoryId: body.categoryId,
        brandId: body.brandId,
        costPrice: body.costPrice,
        sellingPrice: body.sellingPrice,
        wholesalePrice: body.wholesalePrice,
        minStockLevel: body.minStockLevel || 0,
        maxStockLevel: body.maxStockLevel,
        reorderPoint: body.reorderPoint,
        reorderQuantity: body.reorderQuantity,
        weight: body.weight,
        dimensions: body.dimensions,
        color: body.color,
        size: body.size,
        material: body.material,
        status: body.status || 'ACTIVE',
        isTrackable: body.isTrackable ?? true,
        isSerialized: body.isSerialized ?? false,
        leadTimeSupply: body.leadTimeSupply,
        shelfLife: body.shelfLife,
        images: body.images,
        primaryImage: body.primaryImage,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        tags: body.tags,
        createdBy: body.createdBy || 'system' // This should come from auth context
      },
      include: {
        category: true,
        brand: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
