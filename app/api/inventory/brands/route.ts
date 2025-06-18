import { neonClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/inventory/brands - List brands
export async function GET() {
  try {
    const brands = await neonClient.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/brands - Create brand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }

    // Check if brand already exists
    const existingBrand = await neonClient.brand.findUnique({
      where: { name: body.name }
    })

    if (existingBrand) {
      return NextResponse.json(
        { error: 'Brand already exists' },
        { status: 400 }
      )
    }

    const brand = await neonClient.brand.create({
      data: {
        name: body.name,
        description: body.description,
        logo: body.logo,
        website: body.website,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        isActive: body.isActive ?? true
      }
    })

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}
