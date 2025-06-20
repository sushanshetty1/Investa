'use server'

import { neonClient } from '@/lib/db'
import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierQuerySchema,
  productSupplierSchema,
  updateProductSupplierSchema,
  supplierContactSchema,
  updateSupplierContactSchema,
  type CreateSupplierInput,
  type UpdateSupplierInput,
  type SupplierQueryInput,
  type ProductSupplierInput,
  type UpdateProductSupplierInput,
  type SupplierContactInput,
  type UpdateSupplierContactInput,
} from '@/lib/validations/supplier'
import { actionSuccess, actionError, type ActionResponse } from '@/lib/api-utils'
import { revalidatePath } from 'next/cache'

// Create a new supplier
export async function createSupplier(input: CreateSupplierInput): Promise<ActionResponse> {
  try {
    const validatedData = createSupplierSchema.parse(input)

    const supplier = await neonClient.supplier.create({
      data: {
        ...validatedData,
        billingAddress: validatedData.billingAddress,
        shippingAddress: validatedData.shippingAddress,
        certifications: validatedData.certifications,
      },
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        contacts: true,
      },
    })

    revalidatePath('/inventory/suppliers')
    return actionSuccess(supplier, 'Supplier created successfully')
  } catch (error) {
    console.error('Error creating supplier:', error)
    return actionError('Failed to create supplier')
  }
}

// Update an existing supplier
export async function updateSupplier(input: UpdateSupplierInput): Promise<ActionResponse> {
  try {
    const validatedData = updateSupplierSchema.parse(input)
    const { id, ...updateData } = validatedData

    // Check if supplier exists
    const existingSupplier = await neonClient.supplier.findUnique({
      where: { id },
    })

    if (!existingSupplier) {
      return actionError('Supplier not found')
    }

    const supplier = await neonClient.supplier.update({
      where: { id },
      data: {
        ...updateData,
        billingAddress: updateData.billingAddress,
        shippingAddress: updateData.shippingAddress,
        certifications: updateData.certifications,
      },
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        contacts: true,
      },
    })

    revalidatePath('/inventory/suppliers')
    revalidatePath(`/inventory/suppliers/${id}`)
    return actionSuccess(supplier, 'Supplier updated successfully')
  } catch (error) {
    console.error('Error updating supplier:', error)
    return actionError('Failed to update supplier')
  }
}

// Delete a supplier
export async function deleteSupplier(id: string): Promise<ActionResponse> {
  try {
    // Check if supplier exists
    const existingSupplier = await neonClient.supplier.findUnique({
      where: { id },
      include: {
        products: true,
        purchaseOrders: true,
      },
    })

    if (!existingSupplier) {
      return actionError('Supplier not found')
    }

    // Check if supplier has active relationships
    if (existingSupplier.products.length > 0) {
      return actionError('Cannot delete supplier with associated products')
    }

    if (existingSupplier.purchaseOrders.length > 0) {
      return actionError('Cannot delete supplier with purchase order history')
    }

    await neonClient.supplier.delete({
      where: { id },
    })

    revalidatePath('/inventory/suppliers')
    return actionSuccess(null, 'Supplier deleted successfully')
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return actionError('Failed to delete supplier')
  }
}

// Get suppliers with filtering and pagination
export async function getSuppliers(input: SupplierQueryInput): Promise<ActionResponse> {
  try {
    const validatedQuery = supplierQuerySchema.parse(input)
    const { page, limit, search, status, companyType, sortBy, sortOrder } = validatedQuery

    const skip = (page - 1) * limit// Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) where.status = status
    if (companyType) where.companyType = companyType    // Build order clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'code') {
      orderBy.code = sortOrder
    } else if (sortBy === 'rating') {
      orderBy.rating = sortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder
    } const [suppliers, total] = await Promise.all([
      neonClient.supplier.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          products: {
            include: {
              product: {
                select: { id: true, name: true, sku: true },
              },
            },
          },
          contacts: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              products: true,
              purchaseOrders: true,
            },
          },
        },
      }), neonClient.supplier.count({ where }),
    ])

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }

    return actionSuccess({ suppliers, pagination }, 'Suppliers retrieved successfully')
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return actionError('Failed to fetch suppliers')
  }
}

// Get a single supplier by ID
export async function getSupplier(id: string): Promise<ActionResponse> {
  try {
    const supplier = await neonClient.supplier.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, primaryImage: true },
            },
          },
        },
        contacts: true,
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
            purchaseOrders: true,
          },
        },
      },
    })

    if (!supplier) {
      return actionError('Supplier not found')
    }

    return actionSuccess(supplier, 'Supplier retrieved successfully')
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return actionError('Failed to fetch supplier')
  }
}

// Create product-supplier relationship
export async function createProductSupplier(input: ProductSupplierInput): Promise<ActionResponse> {
  try {
    const validatedData = productSupplierSchema.parse(input)

    // Check if product and supplier exist
    const [product, supplier] = await Promise.all([
      neonClient.product.findUnique({ where: { id: validatedData.productId } }),
      neonClient.supplier.findUnique({ where: { id: validatedData.supplierId } }),
    ])

    if (!product) {
      return actionError('Product not found')
    }

    if (!supplier) {
      return actionError('Supplier not found')
    }

    const productSupplier = await neonClient.productSupplier.create({
      data: validatedData,
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        supplier: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    revalidatePath('/inventory/suppliers')
    revalidatePath(`/inventory/suppliers/${validatedData.supplierId}`)
    revalidatePath('/inventory/products')
    revalidatePath(`/inventory/products/${validatedData.productId}`)
    return actionSuccess(productSupplier, 'Product-supplier relationship created successfully')
  } catch (error) {
    console.error('Error creating product-supplier relationship:', error)
    return actionError('Failed to create product-supplier relationship')
  }
}

// Update product-supplier relationship
export async function updateProductSupplier(input: UpdateProductSupplierInput): Promise<ActionResponse> {
  try {
    const validatedData = updateProductSupplierSchema.parse(input)
    const { id, ...updateData } = validatedData

    // Check if relationship exists
    const existingRelationship = await neonClient.productSupplier.findUnique({
      where: { id },
      include: {
        product: true,
        supplier: true,
      },
    })

    if (!existingRelationship) {
      return actionError('Product-supplier relationship not found')
    }

    const productSupplier = await neonClient.productSupplier.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        supplier: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    revalidatePath('/inventory/suppliers')
    revalidatePath(`/inventory/suppliers/${existingRelationship.supplierId}`)
    revalidatePath('/inventory/products')
    revalidatePath(`/inventory/products/${existingRelationship.productId}`)
    return actionSuccess(productSupplier, 'Product-supplier relationship updated successfully')
  } catch (error) {
    console.error('Error updating product-supplier relationship:', error)
    return actionError('Failed to update product-supplier relationship')
  }
}

// Delete product-supplier relationship
export async function deleteProductSupplier(id: string): Promise<ActionResponse> {
  try {
    // Check if relationship exists
    const existingRelationship = await neonClient.productSupplier.findUnique({
      where: { id },
      include: {
        product: true,
        supplier: true,
      },
    })

    if (!existingRelationship) {
      return actionError('Product-supplier relationship not found')
    }

    await neonClient.productSupplier.delete({
      where: { id },
    })

    revalidatePath('/inventory/suppliers')
    revalidatePath(`/inventory/suppliers/${existingRelationship.supplierId}`)
    revalidatePath('/inventory/products')
    revalidatePath(`/inventory/products/${existingRelationship.productId}`)
    return actionSuccess(null, 'Product-supplier relationship deleted successfully')
  } catch (error) {
    console.error('Error deleting product-supplier relationship:', error)
    return actionError('Failed to delete product-supplier relationship')
  }
}

// Create supplier contact
export async function createSupplierContact(input: SupplierContactInput): Promise<ActionResponse> {
  try {
    const validatedData = supplierContactSchema.parse(input)

    // Check if supplier exists
    const supplier = await neonClient.supplier.findUnique({
      where: { id: validatedData.supplierId },
    })

    if (!supplier) {
      return actionError('Supplier not found')
    }

    // If this is set as primary, remove primary from other contacts
    if (validatedData.isPrimary) {
      await neonClient.supplierContact.updateMany({
        where: {
          supplierId: validatedData.supplierId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      })
    }

    const contact = await neonClient.supplierContact.create({
      data: validatedData,
      include: {
        supplier: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    revalidatePath('/inventory/suppliers')
    revalidatePath(`/inventory/suppliers/${validatedData.supplierId}`)
    return actionSuccess(contact, 'Supplier contact created successfully')
  } catch (error) {
    console.error('Error creating supplier contact:', error)
    return actionError('Failed to create supplier contact')
  }
}

// Update supplier contact
export async function updateSupplierContact(input: UpdateSupplierContactInput): Promise<ActionResponse> {
  try {
    const validatedData = updateSupplierContactSchema.parse(input)
    const { id, ...updateData } = validatedData

    // Check if contact exists
    const existingContact = await neonClient.supplierContact.findUnique({
      where: { id },
      include: { supplier: true },
    })

    if (!existingContact) {
      return actionError('Supplier contact not found')
    }

    // If this is set as primary, remove primary from other contacts
    if (updateData.isPrimary) {
      await neonClient.supplierContact.updateMany({
        where: {
          supplierId: existingContact.supplierId,
          isPrimary: true,
          id: { not: id },
        },
        data: { isPrimary: false },
      })
    }

    const contact = await neonClient.supplierContact.update({
      where: { id },
      data: updateData,
      include: {
        supplier: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    revalidatePath('/inventory/suppliers')
    revalidatePath(`/inventory/suppliers/${existingContact.supplierId}`)
    return actionSuccess(contact, 'Supplier contact updated successfully')
  } catch (error) {
    console.error('Error updating supplier contact:', error)
    return actionError('Failed to update supplier contact')
  }
}

// Delete supplier contact
export async function deleteSupplierContact(id: string): Promise<ActionResponse> {
  try {
    // Check if contact exists
    const existingContact = await neonClient.supplierContact.findUnique({
      where: { id },
      include: { supplier: true },
    })

    if (!existingContact) {
      return actionError('Supplier contact not found')
    }

    await neonClient.supplierContact.delete({
      where: { id },
    })

    revalidatePath('/inventory/suppliers')
    revalidatePath(`/inventory/suppliers/${existingContact.supplierId}`)
    return actionSuccess(null, 'Supplier contact deleted successfully')
  } catch (error) {
    console.error('Error deleting supplier contact:', error)
    return actionError('Failed to delete supplier contact')
  }
}
