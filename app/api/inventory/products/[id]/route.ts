import { neonClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/inventory/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await neonClient.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        variants: true,
        inventoryItems: {
          include: {
            warehouse: true
          }
        },
        suppliers: {
          include: {
            supplier: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()

    // Check if product exists
    const existingProduct = await neonClient.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if SKU is being changed and if it conflicts
    if (body.sku && body.sku !== existingProduct.sku) {
      const skuConflict = await neonClient.product.findUnique({
        where: { 
          sku: body.sku,
          NOT: { id }
        }
      })

      if (skuConflict) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        )
      }
    }

    // Update product
    const product = await neonClient.product.update({
      where: { id },
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
        minStockLevel: body.minStockLevel,
        maxStockLevel: body.maxStockLevel,
        reorderPoint: body.reorderPoint,
        reorderQuantity: body.reorderQuantity,
        weight: body.weight,
        dimensions: body.dimensions,
        color: body.color,
        size: body.size,
        material: body.material,
        status: body.status,
        isTrackable: body.isTrackable,
        isSerialized: body.isSerialized,
        leadTimeSupply: body.leadTimeSupply,
        shelfLife: body.shelfLife,
        images: body.images,
        primaryImage: body.primaryImage,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        tags: body.tags
      },
      include: {
        category: true,
        brand: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if product exists
    const existingProduct = await neonClient.product.findUnique({
      where: { id },
      include: {
        inventoryItems: true,
        orderItems: true,
        purchaseItems: true
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if product has inventory or is referenced in orders
    if (existingProduct.inventoryItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing inventory' },
        { status: 400 }
      )
    }

    if (existingProduct.orderItems.length > 0 || existingProduct.purchaseItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product that is referenced in orders' },
        { status: 400 }
      )
    }

    // Soft delete by changing status to DISCONTINUED
    await neonClient.product.update({
      where: { id },
      data: { status: 'DISCONTINUED' }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}