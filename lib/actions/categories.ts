'use server'

import { neonClient } from '@/lib/db'
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CategoryQueryInput,
} from '@/lib/validations/category'
import { actionSuccess, actionError, type ActionResponse } from '@/lib/api-utils'

// Get categories with filtering and pagination
export async function getCategories(input: CategoryQueryInput): Promise<ActionResponse<{
  categories: unknown[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}>> {
  try {
    const validatedInput = categoryQuerySchema.parse(input)
    const { page, limit, search, parentId, level, isActive, sortBy, sortOrder } = validatedInput

    const skip = (page - 1) * limit    // Build where clause
    const where: {
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
      }>
      parentId?: string | null
      level?: number
      isActive?: boolean
    } = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (parentId !== undefined) {
      where.parentId = parentId
    }

    if (level !== undefined) {
      where.level = level
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }    // Build orderBy clause
    const orderBy: {
      name?: 'asc' | 'desc'
      level?: 'asc' | 'desc'
      createdAt?: 'asc' | 'desc'
      updatedAt?: 'asc' | 'desc'
    } = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'level') {
      orderBy.level = sortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder
    }

    // Execute queries
    const [categories, total] = await Promise.all([
      neonClient.category.findMany({
        where,
        include: {
          children: {
            where: { isActive: true },
            include: {
              children: {
                where: { isActive: true }
              }
            }
          },
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          _count: {
            select: {
              products: true,
              children: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      neonClient.category.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return actionSuccess({
      categories,
      pagination: { page, limit, total, totalPages }
    }, `Retrieved ${categories.length} categories`)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return actionError('Failed to fetch categories')
  }
}

// Get a single category by ID
export async function getCategory(id: string): Promise<ActionResponse<unknown>> {
  try {
    const category = await neonClient.category.findUnique({
      where: { id },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true }
            }
          }
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        _count: {
          select: {
            products: true,
            children: true,
          }
        }
      }
    })

    if (!category) {
      return actionError('Category not found')
    }

    return actionSuccess(category, 'Category retrieved successfully')
  } catch (error) {
    console.error('Error fetching category:', error)
    return actionError('Failed to fetch category')
  }
}

// Create a new category
export async function createCategory(input: CreateCategoryInput): Promise<ActionResponse<unknown>> {
  try {
    const validatedInput = createCategorySchema.parse(input)
    const { name, description, parentId, icon, color, image, isActive } = validatedInput

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingCategory = await neonClient.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return actionError('Category with this name already exists')
    }

    // Calculate level and path
    let level = 0
    let path = `/${slug}`
    
    if (parentId) {
      const parent = await neonClient.category.findUnique({
        where: { id: parentId }
      })

      if (!parent) {
        return actionError('Parent category not found')
      }

      level = parent.level + 1
      path = `${parent.path}/${slug}`
    }

    const category = await neonClient.category.create({
      data: {
        name,
        description,
        slug,
        parentId,
        level,
        path,
        icon,
        color,
        image,
        isActive,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        _count: {
          select: {
            products: true,
            children: true,
          }
        }
      }
    })

    return actionSuccess(category, 'Category created successfully')
  } catch (error) {
    console.error('Error creating category:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return actionError('Category with this name already exists')
    }
    
    return actionError('Failed to create category')
  }
}

// Update a category
export async function updateCategory(input: UpdateCategoryInput): Promise<ActionResponse<unknown>> {
  try {
    const validatedInput = updateCategorySchema.parse(input)
    const { id, name, description, parentId, icon, color, image, isActive } = validatedInput

    // Check if category exists
    const existingCategory = await neonClient.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return actionError('Category not found')
    }

    const updateData: {
      name?: string
      description?: string
      slug?: string
      path?: string
      parentId?: string | null
      level?: number
      icon?: string
      color?: string
      image?: string
      isActive?: boolean
      updatedAt: Date
    } = {
      updatedAt: new Date()
    }

    // Handle name changes (regenerate slug and path)
    if (name && name !== existingCategory.name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      
      // Check if new slug already exists (excluding current category)
      const conflictingCategory = await neonClient.category.findFirst({
        where: { 
          slug,
          id: { not: id }
        }
      })

      if (conflictingCategory) {
        return actionError('Category with this name already exists')
      }

      updateData.name = name
      updateData.slug = slug

      // If this is a parent category, update path for all children
      if (slug !== existingCategory.slug && existingCategory.path) {
        const newPath = existingCategory.path.replace(`/${existingCategory.slug}`, `/${slug}`)
        updateData.path = newPath

        // Update children paths recursively
        await updateChildrenPaths(existingCategory.path, newPath)
      }
    }

    // Handle other field updates
    if (description !== undefined) updateData.description = description
    if (parentId !== undefined) updateData.parentId = parentId
    if (icon !== undefined) updateData.icon = icon
    if (color !== undefined) updateData.color = color
    if (image !== undefined) updateData.image = image
    if (isActive !== undefined) updateData.isActive = isActive
    updateData.updatedAt = new Date()

    const category = await neonClient.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        _count: {
          select: {
            products: true,
            children: true,
          }
        }
      }
    })

    return actionSuccess(category, 'Category updated successfully')
  } catch (error) {
    console.error('Error updating category:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return actionError('Category with this name already exists')
    }
    
    return actionError('Failed to update category')
  }
}

// Delete a category
export async function deleteCategory(id: string): Promise<ActionResponse<unknown>> {
  try {
    // Check if category exists
    const existingCategory = await neonClient.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true,
      }
    })

    if (!existingCategory) {
      return actionError('Category not found')
    }

    // Check if category has children
    if (existingCategory.children.length > 0) {
      return actionError('Cannot delete category with subcategories')
    }

    // Check if category has products
    if (existingCategory.products.length > 0) {
      return actionError('Cannot delete category with associated products')
    }

    await neonClient.category.delete({
      where: { id }
    })

    return actionSuccess(undefined, 'Category deleted successfully')
  } catch (error) {
    console.error('Error deleting category:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return actionError('Category cannot be deleted due to existing references')
    }
    
    return actionError('Failed to delete category')
  }
}

// Helper function to update children paths recursively
async function updateChildrenPaths(oldParentPath: string, newParentPath: string) {
  try {
    // Find all categories that start with the old parent path
    const childCategories = await neonClient.category.findMany({
      where: {
        path: {
          startsWith: oldParentPath + '/'
        }
      }
    })

    // Update each child's path
    for (const child of childCategories) {
      const newPath = child.path?.replace(oldParentPath, newParentPath)
      if (newPath) {
        await neonClient.category.update({
          where: { id: child.id },
          data: { path: newPath }
        })
      }
    }
  } catch (error) {
    console.error('Error updating children paths:', error)
    // Don't throw error here to avoid breaking the main update operation
  }
}
