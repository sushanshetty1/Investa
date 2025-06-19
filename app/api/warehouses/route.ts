import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { code: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const [warehouses, total] = await Promise.all([
      neonClient.warehouse.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          code: true,
          address: true,
          phone: true,
          email: true,
          isActive: true,
          type: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      neonClient.warehouse.count({ where })
    ])

    return NextResponse.json({
      warehouses,
      total,
      hasMore: offset + limit < total
    })

  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      code, 
      address, 
      phone, 
      email,
      type = 'STANDARD',
      managerName,
      managerEmail,
      managerPhone
    } = body

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      )
    }

    // Check if warehouse code already exists
    const existingWarehouse = await neonClient.warehouse.findUnique({
      where: { code }
    })

    if (existingWarehouse) {
      return NextResponse.json(
        { error: 'Warehouse code already exists' },
        { status: 400 }
      )
    }

    const warehouse = await neonClient.warehouse.create({
      data: {
        name,
        code,
        address: address || {},
        phone,
        email,
        type,
        managerName,
        managerEmail,
        managerPhone,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        type: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(warehouse, { status: 201 })

  } catch (error) {
    console.error('Error creating warehouse:', error)
    return NextResponse.json(
      { error: 'Failed to create warehouse' },
      { status: 500 }
    )
  }
}
