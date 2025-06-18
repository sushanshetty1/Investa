import { neonClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/inventory/categories - List categories
export async function GET() {
  try {
    const categories = await neonClient.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true }
            }
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: [{ level: 'asc' }, { name: 'asc' }]
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/categories - Create category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingCategory = await neonClient.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      )
    }

    // Calculate level and path
    let level = 0
    let path = `/${slug}`
    
    if (body.parentId) {
      const parent = await neonClient.category.findUnique({
        where: { id: body.parentId }
      })
      
      if (parent) {
        level = parent.level + 1
        path = `${parent.path}/${slug}`
      }
    }

    const category = await neonClient.category.create({
      data: {
        name: body.name,
        description: body.description,
        slug,
        parentId: body.parentId,
        level,
        path,
        icon: body.icon,
        color: body.color,
        image: body.image,
        isActive: body.isActive ?? true
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
