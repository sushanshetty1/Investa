'use server'

import { neonClient } from '@/lib/db'
import {
  createBrandSchema,
  updateBrandSchema,
  brandQuerySchema,
  type CreateBrandInput,
  type UpdateBrandInput,
  type BrandQueryInput,
} from '@/lib/validations/brand'
import { actionSuccess, actionError, type ActionResponse } from '@/lib/api-utils'

// Get brands with filtering and pagination
export async function getBrands(input: BrandQueryInput): Promise<ActionResponse<{
  brands: unknown[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}>> {
  try {
    const validatedInput = brandQuerySchema.parse(input)
    const { page, limit, search, isActive, sortBy, sortOrder } = validatedInput

    const skip = (page - 1) * limit    // Build where clause
    const where: {
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
      }>
      isActive?: boolean
    } = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }

    // Build orderBy clause
    const orderBy: {
      name?: 'asc' | 'desc'
      createdAt?: 'asc' | 'desc'
      updatedAt?: 'asc' | 'desc'
    } = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder
    }

    // Execute queries
    const [brands, total] = await Promise.all([
      neonClient.brand.findMany({
        where,
        include: {
          _count: {
            select: {
              products: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      neonClient.brand.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return actionSuccess({
      brands,
      pagination: { page, limit, total, totalPages }
    }, `Retrieved ${brands.length} brands`)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return actionError('Failed to fetch brands')
  }
}

// Get a single brand by ID
export async function getBrand(id: string): Promise<ActionResponse<unknown>> {
  try {
    const brand = await neonClient.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          }
        }
      }
    })

    if (!brand) {
      return actionError('Brand not found')
    }

    return actionSuccess(brand, 'Brand retrieved successfully')
  } catch (error) {
    console.error('Error fetching brand:', error)
    return actionError('Failed to fetch brand')
  }
}

// Create a new brand
export async function createBrand(input: CreateBrandInput): Promise<ActionResponse<unknown>> {
  try {
    const validatedInput = createBrandSchema.parse(input)
    const { name, description, logo, website, contactEmail, contactPhone, isActive } = validatedInput

    // Check if brand already exists
    const existingBrand = await neonClient.brand.findUnique({
      where: { name }
    })

    if (existingBrand) {
      return actionError('Brand with this name already exists')
    }

    const brand = await neonClient.brand.create({
      data: {
        name,
        description,
        logo,
        website,
        contactEmail,
        contactPhone,
        isActive,
      },
      include: {
        _count: {
          select: {
            products: true,
          }
        }
      }
    })

    return actionSuccess(brand, 'Brand created successfully')
  } catch (error) {
    console.error('Error creating brand:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return actionError('Brand with this name already exists')
    }
    
    return actionError('Failed to create brand')
  }
}

// Update a brand
export async function updateBrand(input: UpdateBrandInput): Promise<ActionResponse<unknown>> {
  try {
    const validatedInput = updateBrandSchema.parse(input)
    const { id, name, description, logo, website, contactEmail, contactPhone, isActive } = validatedInput

    // Check if brand exists
    const existingBrand = await neonClient.brand.findUnique({
      where: { id }
    })

    if (!existingBrand) {
      return actionError('Brand not found')
    }

    // Check if name change conflicts with existing brand
    if (name && name !== existingBrand.name) {
      const conflictingBrand = await neonClient.brand.findFirst({
        where: { 
          name,
          id: { not: id }
        }
      })

      if (conflictingBrand) {
        return actionError('Brand with this name already exists')
      }
    }    const updateData: {
      name?: string
      description?: string
      logo?: string
      website?: string
      contactEmail?: string
      contactPhone?: string
      isActive?: boolean
      updatedAt: Date
    } = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (logo !== undefined) updateData.logo = logo
    if (website !== undefined) updateData.website = website
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone
    if (isActive !== undefined) updateData.isActive = isActive

    const brand = await neonClient.brand.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            products: true,
          }
        }
      }
    })

    return actionSuccess(brand, 'Brand updated successfully')
  } catch (error) {
    console.error('Error updating brand:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return actionError('Brand with this name already exists')
    }
    
    return actionError('Failed to update brand')
  }
}

// Delete a brand
export async function deleteBrand(id: string): Promise<ActionResponse<unknown>> {
  try {
    // Check if brand exists
    const existingBrand = await neonClient.brand.findUnique({
      where: { id },
      include: {
        products: true,
      }
    })

    if (!existingBrand) {
      return actionError('Brand not found')
    }

    // Check if brand has products
    if (existingBrand.products.length > 0) {
      return actionError('Cannot delete brand with associated products')
    }

    await neonClient.brand.delete({
      where: { id }
    })

    return actionSuccess(undefined, 'Brand deleted successfully')
  } catch (error) {
    console.error('Error deleting brand:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return actionError('Brand cannot be deleted due to existing references')
    }
    
    return actionError('Failed to delete brand')
  }
}
