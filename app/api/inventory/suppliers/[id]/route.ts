import { neonClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/inventory/suppliers/[id] - Get single supplier
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplier = await neonClient.supplier.findUnique({
      where: { id: params.id },
      include: {
        purchaseOrders: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          },
          orderBy: { orderDate: 'desc' }
        },
        products: {
          include: {
            product: true
          }
        },
        contacts: true,
        documents: true
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/suppliers/[id] - Update supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Check if supplier exists
    const existingSupplier = await neonClient.supplier.findUnique({
      where: { id: params.id }
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Check if code is being changed and if it conflicts
    if (body.code && body.code !== existingSupplier.code) {
      const codeConflict = await neonClient.supplier.findUnique({
        where: { 
          code: body.code,
          NOT: { id: params.id }
        }
      })

      if (codeConflict) {
        return NextResponse.json(
          { error: 'Supplier code already exists' },
          { status: 400 }
        )
      }
    }

    // Update supplier
    const supplier = await neonClient.supplier.update({
      where: { id: params.id },
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
        currency: body.currency,
        rating: body.rating,
        onTimeDelivery: body.onTimeDelivery,
        qualityRating: body.qualityRating,
        status: body.status,
        certifications: body.certifications,
        notes: body.notes
      }
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/suppliers/[id] - Delete supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if supplier exists
    const existingSupplier = await neonClient.supplier.findUnique({
      where: { id: params.id },
      include: {
        purchaseOrders: true,
        products: true
      }
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Check if supplier has active purchase orders
    const activePurchaseOrders = existingSupplier.purchaseOrders.filter(
      po => !['CANCELLED', 'CLOSED', 'PAID'].includes(po.status)
    )

    if (activePurchaseOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supplier with active purchase orders' },
        { status: 400 }
      )
    }    // Soft delete by changing status to INACTIVE
    await neonClient.supplier.update({
      where: { id: params.id },
      data: { status: 'INACTIVE' }
    })

    return NextResponse.json({ message: 'Supplier deleted successfully' })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    )
  }
}
