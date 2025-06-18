import { neonClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

interface CategoryUpdateData {
  name?: string
  description?: string
  slug?: string
  parentId?: string
  level?: number
  path?: string
  icon?: string
  color?: string
  image?: string
  isActive?: boolean
}

// GET /api/inventory/categories/[id] - Get category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
        parent: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    
    // Check if category exists
    const existingCategory = await neonClient.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }    // Generate new slug if name changed
    const updateData: CategoryUpdateData = { ...body }
    
    if (body.name && body.name !== existingCategory.name) {
      const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        // Check if new slug already exists (excluding current category)
      const conflictingCategory = await neonClient.category.findFirst({
        where: { 
          slug,
          id: { not: id }
        }
      })

      if (conflictingCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        )
      }

      updateData.slug = slug      // If this is a parent category, update path for all children
      if (slug !== existingCategory.slug && existingCategory.path) {
        const newPath = existingCategory.path.replace(`/${existingCategory.slug}`, `/${slug}`)
        updateData.path = newPath

        // Update children paths recursively
        await updateChildrenPaths(existingCategory.path, newPath)
      }
    }    const category = await neonClient.category.update({
      where: { id },
      data: updateData,
      include: {
        children: {
          where: { isActive: true }
        },
        parent: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Check if category exists
    const category = await neonClient.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that has products. Move products to another category first.' },
        { status: 400 }
      )
    }

    // Check if category has children
    if (category.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that has subcategories. Delete subcategories first.' },
        { status: 400 }
      )
    }    await neonClient.category.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}

// Helper function to update children paths recursively
async function updateChildrenPaths(oldParentPath: string, newParentPath: string) {
  const children = await neonClient.category.findMany({
    where: {
      path: {
        startsWith: oldParentPath + '/'
      }
    }
  })
  for (const child of children) {
    if (child.path) {
      const newPath = child.path.replace(oldParentPath, newParentPath)
      await neonClient.category.update({
        where: { id: child.id },
        data: { path: newPath }
      })
    }
  }
}
